import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mail'
import { createCalendarEvent } from '@/lib/google-calendar'

/**
 * Endpoint pour traiter manuellement une commande si le webhook n'a pas fonctionné
 * Accès: POST /api/webhooks/stripe/manual-process
 * Body: { sessionId: "cs_live_..." }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sessionId = body.sessionId

    if (!sessionId) {
      return Response.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer_details', 'custom_fields'],
    })

    const orderId = (session.metadata as Record<string, string> | null)?.orderId
    if (!orderId) {
      return Response.json({ error: 'Order ID not found in session metadata' }, { status: 400 })
    }

    // Vérifier si le paiement est complété
    const paymentStatus = session.payment_status
    const isPaid = paymentStatus === 'paid' || session.status === 'complete'

    if (!isPaid) {
      return Response.json({ 
        error: 'Payment not completed',
        paymentStatus,
        sessionStatus: session.status,
      }, { status: 400 })
    }

    // Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, customer: true },
    })

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'PAID') {
      return Response.json({ 
        message: 'Order already processed',
        orderNumber: order.orderNumber,
        status: order.status,
      })
    }

    // Traiter la commande (même logique que le webhook)
    const email = session.customer_details?.email || session.customer_email || undefined
    const name = session.customer_details?.name || undefined
    const phone = session.customer_details?.phone || undefined
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || undefined

    // Upsert customer
    let customerId: string | undefined
    if (email) {
      const customer = await prisma.customer.upsert({
        where: { email },
        create: { email, name: name || null, phone: phone || null },
        update: { name: name || undefined, phone: phone || undefined },
      })
      customerId = customer.id
    }

    // Mettre à jour le statut
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        email: email || undefined,
        stripePaymentIntentId: paymentIntentId || undefined,
        ...(customerId ? { customer: { connect: { id: customerId } } } : {}),
      },
    })

    // Marquer la disponibilité comme réservée
    if (order.reservationDate && order.items.length > 0) {
      const productId = order.items[0].productId
      if (productId) {
        const reservationDate = order.reservationDate
        const existingAvailability = await prisma.productAvailability.findFirst({
          where: { productId, date: reservationDate },
        })

        if (existingAvailability) {
          await prisma.productAvailability.update({
            where: { id: existingAvailability.id },
            data: { isAvailable: false },
          })
        } else {
          await prisma.productAvailability.create({
            data: { productId, date: reservationDate, isAvailable: false },
          })
        }
      }
    }

    // Créer l'événement Google Calendar
    let calendarEventId: string | undefined
    if (order.reservationDate) {
      try {
        const productName = order.items[0]?.product?.name || 'Commande'
        const orderTotal = (order.totalAmount / 100).toFixed(2)
        const currencySymbol = order.currency === 'EUR' ? '€' : order.currency
        const customerName = name || email?.split('@')[0] || 'Client'

        const eventSummary = `📅 ${productName} - ${order.orderNumber}`
        const eventDescription = `
Commande: ${order.orderNumber}
Client: ${customerName}${email ? ` (${email})` : ''}${phone ? `\nTéléphone: ${phone}` : ''}
Montant: ${orderTotal}${currencySymbol}

Articles:
${order.items.map(item => `• ${item.name} × ${item.quantity}`).join('\n')}
        `.trim()

        const reservationDate = new Date(order.reservationDate)
        reservationDate.setHours(9, 0, 0, 0)
        const endDate = new Date(reservationDate)
        endDate.setHours(18, 0, 0, 0)

        calendarEventId = await createCalendarEvent({
          summary: eventSummary,
          description: eventDescription,
          startDateTime: reservationDate,
          endDateTime: endDate,
          attendees: email ? [{ email, name: customerName }] : undefined,
        })
      } catch (calendarError) {
        console.error('[manual-process] Failed to create Google Calendar event:', calendarError)
      }
    }

    // Envoyer les emails
    let emailSent = false
    if (email) {
      try {
        const orderTotal = (order.totalAmount / 100).toFixed(2)
        const currencySymbol = order.currency === 'EUR' ? '€' : order.currency
        const reservationDateStr = order.reservationDate
          ? new Date(order.reservationDate).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : null

        const itemsList = order.items
          .map(
            (item) =>
              `• ${item.name} × ${item.quantity} - ${((item.unitAmount * item.quantity) / 100).toFixed(2)}${currencySymbol}`
          )
          .join('\n')

        const customerName = name || email.split('@')[0]

        const htmlCustomer = `
          <div style="font-family:system-ui,Arial,sans-serif;font-size:14px;line-height:1.6;max-width:600px;margin:0 auto">
            <h2 style="color:#1a1a1a;margin:0 0 20px 0">Confirmation de votre commande</h2>
            <p>Bonjour${customerName ? ` ${customerName}` : ''},</p>
            <p>Nous avons bien reçu votre paiement. Votre commande a été confirmée.</p>
            
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
              <h3 style="margin:0 0 12px 0;color:#1a1a1a">Détails de la commande</h3>
              <p style="margin:4px 0"><strong>Numéro de commande:</strong> ${order.orderNumber}</p>
              <p style="margin:4px 0"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
              ${reservationDateStr ? `<p style="margin:4px 0"><strong>Date de réservation:</strong> ${reservationDateStr}</p>` : ''}
            </div>

            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
              <h3 style="margin:0 0 12px 0;color:#1a1a1a">Articles commandés</h3>
              <pre style="white-space:pre-wrap;font-family:inherit;margin:0">${itemsList}</pre>
            </div>

            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:20px 0">
              <p style="margin:0;font-size:18px;font-weight:600;color:#166534">
                <strong>Total payé: ${orderTotal}${currencySymbol}</strong>
              </p>
            </div>

            <p style="margin-top:24px">Nous vous contacterons prochainement pour finaliser les détails de votre réservation.</p>
            <p style="margin-top:16px">Cordialement,<br/><strong>Visit Makkah</strong></p>
          </div>
        `

        await sendMail({
          to: email,
          subject: `Confirmation de commande ${order.orderNumber}`,
          html: htmlCustomer,
          text: `Confirmation de votre commande ${order.orderNumber}\n\nTotal payé: ${orderTotal}${currencySymbol}`,
        })

        emailSent = true
      } catch (emailError) {
        console.error('[manual-process] Failed to send customer email:', emailError)
      }
    }

    // Email admin
    let adminEmailSent = false
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'visitmakkah@visit-makkah.fr'
      const orderTotal = (order.totalAmount / 100).toFixed(2)
      const currencySymbol = order.currency === 'EUR' ? '€' : order.currency
      const reservationDateStr = order.reservationDate
        ? new Date(order.reservationDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null

      const itemsList = order.items
        .map(
          (item) =>
            `• ${item.name} × ${item.quantity} - ${((item.unitAmount * item.quantity) / 100).toFixed(2)}${currencySymbol}`
        )
        .join('\n')

      const htmlAdmin = `
        <div style="font-family:system-ui,Arial,sans-serif;font-size:14px;line-height:1.6">
          <h2 style="color:#dc2626;margin:0 0 20px 0">🛒 Nouvelle commande payée</h2>
          <p><strong>Numéro de commande:</strong> ${order.orderNumber}</p>
          <p><strong>Client:</strong> ${name || '—'} (${email || '—'})</p>
          <p><strong>Montant:</strong> ${orderTotal}${currencySymbol}</p>
          ${reservationDateStr ? `<p><strong>Date de réservation:</strong> ${reservationDateStr}</p>` : ''}
          <p><strong>Articles:</strong></p>
          <pre style="white-space:pre-wrap;font-family:inherit">${itemsList}</pre>
        </div>
      `

      await sendMail({
        to: adminEmail,
        subject: `[Nouvelle commande] ${order.orderNumber} - ${orderTotal}${currencySymbol}`,
        html: htmlAdmin,
        text: `Nouvelle commande ${order.orderNumber}\n\nClient: ${name || '—'} (${email || '—'})\nMontant: ${orderTotal}${currencySymbol}`,
        replyTo: email || undefined,
      })

      adminEmailSent = true
    } catch (emailError) {
      console.error('[manual-process] Failed to send admin email:', emailError)
    }

    return Response.json({
      success: true,
      message: 'Order processed successfully',
      order: {
        orderNumber: order.orderNumber,
        status: 'PAID',
        email,
        emailSent,
        adminEmailSent,
        calendarEventCreated: !!calendarEventId,
        calendarEventId,
      },
    })
  } catch (error) {
    console.error('[manual-process] Error:', error)
    return Response.json({
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

