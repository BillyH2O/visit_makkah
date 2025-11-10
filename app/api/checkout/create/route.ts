import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'
}

function generateOrderNumber(): string {
  const now = new Date()
  const y = String(now.getFullYear())
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `ORD-${y}${m}${d}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { productId, quantity = 1, successUrl, cancelUrl, customerEmail } = body as {
      productId?: string
      quantity?: number
      successUrl?: string
      cancelUrl?: string
      customerEmail?: string
    }

    if (!productId) {
      return new Response('Missing productId', { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        prices: {
          where: { active: true },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
          take: 1,
        },
        category: true,
      },
    })

    if (!product || !product.active) {
      return new Response('Product not found or inactive', { status: 404 })
    }

    const defaultPrice = product.prices[0]
    if (!defaultPrice || defaultPrice.unitAmount == null || !defaultPrice.currency) {
      return new Response('Product has no active price', { status: 400 })
    }

    const baseUrl = getBaseUrl()
    const success = successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancel = cancelUrl || `${baseUrl}/checkout/cancel`

    // Create a pending order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        email: customerEmail || '',
        currency: defaultPrice.currency,
        totalAmount: defaultPrice.unitAmount * quantity,
        items: {
          create: [
            {
              name: product.name,
              quantity,
              unitAmount: defaultPrice.unitAmount,
              currency: defaultPrice.currency,
              product: { connect: { id: product.id } },
              price: defaultPrice.id ? { connect: { id: defaultPrice.id } } : undefined,
            },
          ],
        },
      },
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity,
          price_data: {
            currency: defaultPrice.currency,
            unit_amount: defaultPrice.unitAmount,
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
          },
        },
      ],
      success_url: success,
      cancel_url: cancel,
      metadata: { orderId: order.id, orderNumber: order.orderNumber, productId: product.id },
      customer_email: customerEmail || undefined,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeCheckoutSessionId: session.id,
        paymentLinkUrl: session.url || undefined,
      },
    })

    return Response.json({ url: session.url, id: session.id })
  } catch (e) {
    return new Response(`Server error: ${e instanceof Error ? e.message : 'Unknown error'}`, { status: 500 })
  }
}
