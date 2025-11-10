import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new Response('Missing STRIPE_WEBHOOK_SECRET', { status: 500 })
  }
  if (!signature) {
    return new Response('Missing Stripe signature', { status: 400 })
  }

  const payload = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(`Webhook signature verification failed: ${msg}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId: string | undefined = (session.metadata as Record<string, string> | null | undefined)?.orderId
        const email: string | undefined = session.customer_details?.email || session.customer_email || undefined
        const name: string | undefined = session.customer_details?.name || undefined
        const phone: string | undefined = session.customer_details?.phone || undefined
        const paymentIntentId: string | undefined = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || undefined

        // Upsert customer if email is provided
        let customerId: string | undefined
        if (email) {
          const customer = await prisma.customer.upsert({
            where: { email },
            create: { email, name: name || null, phone: phone || null },
            update: { name: name || undefined, phone: phone || undefined },
          })
          customerId = customer.id
        }

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
              email: email || undefined,
              stripePaymentIntentId: paymentIntentId || undefined,
              ...(customerId ? { customer: { connect: { id: customerId } } } : {}),
            },
          })
        }
        break
      }
      default: {
        // Ignore other events for now
        break
      }
    }
    return new Response('OK', { status: 200 })
  } catch (err: unknown) {
    console.error('[webhooks/stripe] handler error', err)
    return new Response('Webhook handler error', { status: 500 })
  }
}
