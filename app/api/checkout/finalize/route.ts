import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      return new Response('Missing session_id', { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer_details', 'shipping_details', 'custom_fields'],
    })

    const orderId = (session.metadata as Record<string, string> | null)?.orderId
    if (!orderId) {
      return new Response('Order metadata missing', { status: 400 })
    }

    const s = session as unknown as Stripe.Checkout.Session
    const cd = s.customer_details || null
    const customFields = (s.custom_fields ?? undefined) as Array<{ key: string; text?: { value?: string | null } }> | undefined

    const firstName =
      customFields?.find((f) => f.key === 'first_name')?.text?.value ||
      (cd?.name ? cd.name.split(' ').slice(0, -1).join(' ') || cd.name : null)
    const lastName =
      customFields?.find((f) => f.key === 'last_name')?.text?.value ||
      (cd?.name ? cd.name.split(' ').slice(-1).join(' ') : null)

    const address = cd?.address

    await prisma.order.update({
      where: { id: orderId },
      data: {
        email: cd?.email || undefined,
        metadata: {
          ...(session.metadata || {}),
          customer_snapshot: {
            firstName: firstName || null,
            lastName: lastName || null,
            phone: cd?.phone || null,
            email: cd?.email || null,
            address: address
              ? {
                  line1: address.line1 || null,
                  line2: address.line2 || null,
                  city: address.city || null,
                  postal_code: address.postal_code || null,
                  country: address.country || null,
                }
              : null,
          },
        },
      },
    })

    return Response.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return new Response(`Server error: ${message}`, { status: 500 })
  }
}


