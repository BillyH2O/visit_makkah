import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Vérifie le statut d'une commande spécifique
 * Accès: GET /api/webhooks/stripe/check-order?orderId=xxx
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const orderNumber = searchParams.get('orderNumber')

  if (!orderId && !orderNumber) {
    return Response.json({
      error: true,
      message: 'Provide orderId or orderNumber as query parameter',
    }, { status: 400 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: orderId ? { id: orderId } : { orderNumber: orderNumber! },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    })

    if (!order) {
      return Response.json({
        error: true,
        message: 'Order not found',
      }, { status: 404 })
    }

    // Vérifier la configuration
    const config = {
      smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD),
      adminEmail: process.env.ADMIN_EMAIL || 'non configuré',
      googleCalendarConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN),
    }

    // Diagnostic
    const diagnostic = {
      orderStatus: order.status,
      webhookProcessed: order.status === 'PAID',
      hasEmail: !!order.email,
      hasReservationDate: !!order.reservationDate,
      hasStripePaymentIntentId: !!order.stripePaymentIntentId,
      hasStripeCheckoutSessionId: !!order.stripeCheckoutSessionId,
      issues: [] as string[],
    }

    if (order.status === 'PENDING') {
      diagnostic.issues.push('⚠️ La commande est toujours en PENDING - le webhook n\'a pas mis à jour le statut')
    }

    if (!order.email) {
      diagnostic.issues.push('⚠️ Aucun email associé à la commande')
    }

    if (!config.smtpConfigured) {
      diagnostic.issues.push('❌ Configuration SMTP incomplète - les emails ne peuvent pas être envoyés')
    }

    if (order.reservationDate && !config.googleCalendarConfigured) {
      diagnostic.issues.push('❌ Configuration Google Calendar incomplète - les événements ne peuvent pas être créés')
    }

    return Response.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        email: order.email,
        totalAmount: order.totalAmount / 100,
        currency: order.currency,
        reservationDate: order.reservationDate?.toISOString() || null,
        stripeCheckoutSessionId: order.stripeCheckoutSessionId,
        stripePaymentIntentId: order.stripePaymentIntentId,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitAmount: item.unitAmount / 100,
        })),
      },
      config,
      diagnostic,
      recommendations: {
        ifPending: 'Si la commande est PENDING, vérifiez dans Stripe Dashboard si le webhook checkout.session.completed a réussi',
        ifNoEmail: 'Si aucun email n\'est envoyé, vérifiez la configuration SMTP avec /api/webhooks/stripe/diagnostic',
        ifNoCalendar: 'Si aucun événement Google Calendar n\'est créé, vérifiez la configuration avec /api/webhooks/stripe/diagnostic',
      },
    })
  } catch (error) {
    return Response.json({
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

