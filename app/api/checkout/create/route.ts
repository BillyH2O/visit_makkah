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
    const { productId, quantity = 1, successUrl, cancelUrl, customerEmail, peopleCount, reservationDate } = body as {
      productId?: string
      quantity?: number
      successUrl?: string
      cancelUrl?: string
      customerEmail?: string
      peopleCount?: number
      reservationDate?: string
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

    // Load deposit settings (global)
    const [depositEnabledSetting, depositPercentSetting] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: 'depositEnabled' } }),
      prisma.siteSetting.findUnique({ where: { key: 'depositPercent' } }),
    ])
    const categoryCode = product.category?.code
    const isVisaCategory = categoryCode === 'VISA'
    const isSadaqaCategory = categoryCode === 'SADAQA'
    const depositEnabled = depositEnabledSetting?.value != null ? depositEnabledSetting.value === 'true' : true
    const depositPercentRaw = depositPercentSetting?.value != null ? Number.parseFloat(depositPercentSetting.value) : 20
    const depositPercent = Number.isFinite(depositPercentRaw) ? Math.min(100, Math.max(1, Math.round(depositPercentRaw))) : 20
    // VISA et SADAQA paient toujours la totalité (pas d'acompte)
    const depositFactor = (!isVisaCategory && !isSadaqaCategory && depositEnabled) ? depositPercent / 100 : 1

    // Compute optional per-person surcharge based on metadata
    const meta = (product.metadata as { includedPeople?: number; extraPerPersonCents?: number } | null) || {}
    const includedPeople = typeof meta.includedPeople === 'number' ? meta.includedPeople : 0
    const extraPerPersonCents = typeof meta.extraPerPersonCents === 'number' ? meta.extraPerPersonCents : 0
    const groupSize = typeof peopleCount === 'number' && peopleCount > 0 ? peopleCount : 1
    
    // Nouvelle logique : les personnes incluses paient le prix de base, les supplémentaires paient seulement le supplément
    // Exemple : 100€ avec supplément 10€ à partir de 3 personnes
    // - 3 personnes : 3 × 100€ = 300€
    // - 4 personnes : 3 × 100€ + 1 × 10€ = 310€
    // - 5 personnes : 3 × 100€ + 2 × 10€ = 320€
    const baseUnitAmountDeposit = Math.round(defaultPrice.unitAmount * depositFactor)
    const extraUnitAmountDeposit = Math.round(extraPerPersonCents * depositFactor)
    
    let baseUnits = 0
    let extraUnits = 0
    let baseAmount = 0
    let extraAmount = 0
    
    if (includedPeople > 0 && groupSize > includedPeople) {
      // Cas avec personnes incluses : les premières paient le prix de base, les autres seulement le supplément
      baseUnits = includedPeople
      extraUnits = groupSize - includedPeople
      baseAmount = baseUnitAmountDeposit * baseUnits * quantity
      extraAmount = extraUnitAmountDeposit * extraUnits * quantity
    } else {
      // Cas sans personnes incluses ou nombre <= personnes incluses : tout le monde paie le prix de base
      baseUnits = groupSize
      extraUnits = 0
      baseAmount = baseUnitAmountDeposit * baseUnits * quantity
      extraAmount = 0
    }
    
    const orderTotal = baseAmount + extraAmount

    // Parse reservation date if provided
    const parsedReservationDate = reservationDate ? new Date(reservationDate) : null
    
    // Create a pending order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        email: customerEmail || '',
        currency: defaultPrice.currency,
        totalAmount: orderTotal,
        reservationDate: parsedReservationDate && !isNaN(parsedReservationDate.getTime()) ? parsedReservationDate : null,
        items: {
          create: [
            {
              name: product.name,
              quantity: baseUnits * quantity,
              unitAmount: baseUnitAmountDeposit,
              currency: defaultPrice.currency,
              product: { connect: { id: product.id } },
              price: defaultPrice.id ? { connect: { id: defaultPrice.id } } : undefined,
            },
            ...(
              extraAmount > 0
                ? [
                    {
                      name: 'Supplément personnes',
                      quantity: extraUnits * quantity,
                      unitAmount: extraUnitAmountDeposit,
                      currency: defaultPrice.currency,
                    },
                  ]
                : []
            ),
          ],
        },
      },
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      phone_number_collection: { enabled: true },
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['FR', 'BE', 'CH', 'MA', 'DZ', 'TN'] },
      custom_fields: [
        {
          key: 'first_name',
          label: { type: 'custom', custom: 'Prénom' },
          type: 'text',
          optional: false,
        },
        {
          key: 'last_name',
          label: { type: 'custom', custom: 'Nom' },
          type: 'text',
          optional: false,
        },
      ],
      line_items: [
        {
          quantity: baseUnits * quantity,
          price_data: {
            currency: defaultPrice.currency,
            unit_amount: baseUnitAmountDeposit,
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
          },
        },
        ...(
          extraAmount > 0
            ? [
                {
                  quantity: extraUnits * quantity,
                  price_data: {
                    currency: defaultPrice.currency,
                    unit_amount: extraUnitAmountDeposit,
                    product_data: {
                      name: 'Supplément personnes',
                      description:
                        includedPeople > 0
                          ? `Inclus: ${includedPeople} pers. × ${(defaultPrice.unitAmount / 100).toFixed(0)}€ | Supplément: ${extraUnits} pers. × ${(extraPerPersonCents / 100).toFixed(0)}€`
                          : `${extraUnits} x ${(extraPerPersonCents / 100).toFixed(0)}€`,
                    },
                  },
                },
              ]
            : []
        ),
      ],
      success_url: success,
      cancel_url: cancel,
      metadata: { orderId: order.id, orderNumber: order.orderNumber, productId: product.id, peopleCount: String(groupSize), depositFactor: String(depositFactor) },
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
