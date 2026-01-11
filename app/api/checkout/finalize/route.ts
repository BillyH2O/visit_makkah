import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { sendMail } from '@/lib/mail'
import { createCalendarEvent } from '@/lib/google-calendar'
import type Stripe from 'stripe'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      return new Response('Missing session_id', { status: 400 })
    }

    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer_details', 'custom_fields'],
      })
    } catch (stripeError) {
      console.error('[checkout/finalize] Stripe error:', stripeError)
      const message = stripeError instanceof Error ? stripeError.message : 'Failed to retrieve Stripe session'
      return new Response(`Stripe error: ${message}`, { status: 500 })
    }

    const orderId = (session.metadata as Record<string, string> | null)?.orderId
    if (!orderId) {
      console.error('[checkout/finalize] Order metadata missing for session:', sessionId)
      return new Response('Order metadata missing', { status: 400 })
    }

    // Vérifier si le paiement est complété
    const paymentStatus = session.payment_status
    const isPaid = paymentStatus === 'paid' || session.status === 'complete'

    console.log(`[checkout/finalize] Payment status: ${paymentStatus}, Session status: ${session.status}, Is paid: ${isPaid}`)

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
    const email = cd?.email || session.customer_email || undefined
    const name = cd?.name || undefined
    const phone = cd?.phone || undefined
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || undefined

    // Récupérer la commande pour vérifier son statut actuel
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, customer: true },
    })

    if (!order) {
      console.error('[checkout/finalize] Order not found:', orderId)
      return new Response('Order not found', { status: 404 })
    }

    // Si le paiement est complété et la commande est encore PENDING, faire les actions du webhook
    const needsWebhookActions = isPaid && order.status === 'PENDING'

    if (needsWebhookActions) {
      console.log('[checkout/finalize] Payment completed but order still PENDING. Processing webhook actions...')

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

      // Mettre à jour le statut de la commande
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          email: email || undefined,
          stripePaymentIntentId: paymentIntentId || undefined,
          ...(customerId ? { customer: { connect: { id: customerId } } } : {}),
          metadata: {
            ...(session.metadata || {}),
            customer_snapshot: {
              firstName: firstName || null,
              lastName: lastName || null,
              phone: phone || null,
              email: email || null,
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

      // Marquer la disponibilité comme réservée si date de réservation
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

          await createCalendarEvent({
            summary: eventSummary,
            description: eventDescription,
            startDateTime: reservationDate,
            endDateTime: endDate,
            attendees: email ? [{ email, name: customerName }] : undefined,
          })

          console.log(`[checkout/finalize] Google Calendar event created for order ${order.orderNumber}`)
        } catch (calendarError) {
          console.error('[checkout/finalize] Failed to create Google Calendar event:', calendarError)
        }
      }

      // Envoyer les emails
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

          // Email client
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

          console.log(`[checkout/finalize] Customer email sent to ${email}`)
        } catch (emailError) {
          console.error('[checkout/finalize] Failed to send customer email:', emailError)
        }
      }

      // Email admin
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

        console.log(`[checkout/finalize] Admin email sent to ${adminEmail}`)
      } catch (emailError) {
        console.error('[checkout/finalize] Failed to send admin email:', emailError)
      }

      return Response.json({ 
        ok: true, 
        message: 'Order finalized and webhook actions processed',
        orderStatus: 'PAID',
      })
    } else {
      // Mise à jour normale des métadonnées seulement
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            email: email || undefined,
            metadata: {
              ...(session.metadata || {}),
              customer_snapshot: {
                firstName: firstName || null,
                lastName: lastName || null,
                phone: phone || null,
                email: email || null,
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
      } catch (dbError) {
        console.error('[checkout/finalize] Database error:', dbError)
        const message = dbError instanceof Error ? dbError.message : 'Failed to update order'
        return new Response(`Database error: ${message}`, { status: 500 })
      }

      return Response.json({ 
        ok: true, 
        message: 'Order metadata updated',
        orderStatus: order.status,
        paymentStatus,
      })
    }
  } catch (e) {
    console.error('[checkout/finalize] Unexpected error:', e)
    const message = e instanceof Error ? e.message : 'Unknown error'
    const stack = e instanceof Error ? e.stack : undefined
    console.error('[checkout/finalize] Stack trace:', stack)
    return new Response(`Server error: ${message}`, { status: 500 })
  }
}


