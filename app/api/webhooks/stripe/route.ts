import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mail'
import { createCalendarEvent } from '@/lib/google-calendar'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  console.log('[webhooks/stripe] ========== WEBHOOK CALLED ==========')
  console.log('[webhooks/stripe] Timestamp:', new Date().toISOString())
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  console.log('[webhooks/stripe] Signature present:', !!signature)
  console.log('[webhooks/stripe] Webhook secret configured:', !!webhookSecret)
  console.log('[webhooks/stripe] Webhook secret length:', webhookSecret?.length || 0)
  console.log('[webhooks/stripe] Webhook secret prefix:', webhookSecret?.substring(0, 5) || 'none')

  if (!webhookSecret) {
    console.error('[webhooks/stripe] ❌ Missing STRIPE_WEBHOOK_SECRET in environment variables')
    console.error('[webhooks/stripe] Vérifiez que STRIPE_WEBHOOK_SECRET est dans votre fichier .env')
    return new Response('Missing STRIPE_WEBHOOK_SECRET', { status: 500 })
  }
  if (!signature) {
    console.warn('[webhooks/stripe] ⚠️ Missing Stripe signature header')
    console.warn('[webhooks/stripe] Cela peut signifier que l\'appel ne vient pas de Stripe')
    console.warn('[webhooks/stripe] Vérifiez que le webhook est bien configuré dans Stripe Dashboard')
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

  console.log(`[webhooks/stripe] Received event: ${event.type} (id: ${event.id})`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('[webhooks/stripe] Processing checkout.session.completed event')
        const session = event.data.object as Stripe.Checkout.Session
        const orderId: string | undefined = (session.metadata as Record<string, string> | null | undefined)?.orderId
        const email: string | undefined = session.customer_details?.email || session.customer_email || undefined
        const name: string | undefined = session.customer_details?.name || undefined
        const phone: string | undefined = session.customer_details?.phone || undefined
        const paymentIntentId: string | undefined = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || undefined

        console.log(`[webhooks/stripe] Order ID: ${orderId}, Email: ${email}, Name: ${name}`)

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
          // Get order to check if it has a reservation date
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } },
          })

          if (!order) {
            console.error(`[webhooks/stripe] Order not found: ${orderId}`)
            break
          }

          // Update order status
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
              email: email || undefined,
              stripePaymentIntentId: paymentIntentId || undefined,
              ...(customerId ? { customer: { connect: { id: customerId } } } : {}),
            },
          })

          // If order has a reservation date, mark it as unavailable
          if (order.reservationDate && order.items.length > 0) {
            const productId = order.items[0].productId
            if (productId) {
              const reservationDate = order.reservationDate
              // Check if availability entry already exists
              const existingAvailability = await prisma.productAvailability.findFirst({
                where: {
                  productId,
                  date: reservationDate,
                },
              })

              if (existingAvailability) {
                // Update to unavailable if it exists
                await prisma.productAvailability.update({
                  where: { id: existingAvailability.id },
                  data: { isAvailable: false },
                })
              } else {
                // Create new entry as unavailable
                await prisma.productAvailability.create({
                  data: {
                    productId,
                    date: reservationDate,
                    isAvailable: false,
                  },
                })
              }
            }

            // Create Google Calendar event if reservation date exists
            if (order.reservationDate) {
              // Vérifier la configuration Google Calendar
              const googleCalendarConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN)
              if (!googleCalendarConfigured) {
                console.warn('[webhooks/stripe] ⚠️ Configuration Google Calendar incomplète. Variables manquantes:')
                console.warn('[webhooks/stripe]   GOOGLE_CLIENT_ID:', !!process.env.GOOGLE_CLIENT_ID)
                console.warn('[webhooks/stripe]   GOOGLE_CLIENT_SECRET:', !!process.env.GOOGLE_CLIENT_SECRET)
                console.warn('[webhooks/stripe]   GOOGLE_REFRESH_TOKEN:', !!process.env.GOOGLE_REFRESH_TOKEN)
              }
              
              try {
                if (!googleCalendarConfigured) {
                  throw new Error('Google Calendar not configured - cannot create event')
                }
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

                // Créer l'événement pour toute la journée de réservation
                const reservationDate = new Date(order.reservationDate)
                // Définir l'heure de début à 9h00
                reservationDate.setHours(9, 0, 0, 0)
                // Définir l'heure de fin à 18h00 (même jour)
                const endDate = new Date(reservationDate)
                endDate.setHours(18, 0, 0, 0)

                await createCalendarEvent({
                  summary: eventSummary,
                  description: eventDescription,
                  startDateTime: reservationDate,
                  endDateTime: endDate,
                  attendees: email ? [{ email, name: customerName }] : undefined,
                })

                console.log(`[webhooks/stripe] Google Calendar event created for order ${order.orderNumber}`)
              } catch (calendarError) {
                console.error('[webhooks/stripe] Failed to create Google Calendar event:', calendarError)
                // Ne pas faire échouer le webhook si la création de l'événement échoue
              }
            }
          }

          // Send confirmation email to customer
          console.log(`[webhooks/stripe] Preparing to send emails. Email: ${email}`)
          
          // Vérifier la configuration SMTP avant d'envoyer
          const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD)
          if (!smtpConfigured) {
            console.error('[webhooks/stripe] ❌ Configuration SMTP incomplète. Variables manquantes:')
            console.error('[webhooks/stripe]   SMTP_HOST:', !!process.env.SMTP_HOST)
            console.error('[webhooks/stripe]   SMTP_PORT:', !!process.env.SMTP_PORT)
            console.error('[webhooks/stripe]   SMTP_USER:', !!process.env.SMTP_USER)
            console.error('[webhooks/stripe]   SMTP_PASSWORD:', !!process.env.SMTP_PASSWORD)
          }
          
          if (email) {
            try {
              console.log(`[webhooks/stripe] Sending confirmation email to customer: ${email}`)
              if (!smtpConfigured) {
                throw new Error('SMTP not configured - cannot send email')
              }
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
                  
                  <p style="margin-top:24px;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:16px">
                    Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:visitmakkah@visit-makkah.fr" style="color:#2563eb">visitmakkah@visit-makkah.fr</a>
                  </p>
                </div>
              `

              const textCustomer = `Confirmation de votre commande

Bonjour${customerName ? ` ${customerName}` : ''},

Nous avons bien reçu votre paiement. Votre commande a été confirmée.

Détails de la commande:
- Numéro de commande: ${order.orderNumber}
- Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}
${reservationDateStr ? `- Date de réservation: ${reservationDateStr}\n` : ''}

Articles commandés:
${itemsList}

Total payé: ${orderTotal}${currencySymbol}

Nous vous contacterons prochainement pour finaliser les détails de votre réservation.

Cordialement,
Visit Makkah

Pour toute question: visitmakkah@visit-makkah.fr`

              await sendMail({
                to: email,
                subject: `Confirmation de commande ${order.orderNumber}`,
                html: htmlCustomer,
                text: textCustomer,
              })
              console.log(`[webhooks/stripe] Customer email sent successfully to ${email}`)
            } catch (emailError) {
              console.error('[webhooks/stripe] Failed to send customer email:', emailError)
              // Don't fail the webhook if email fails
            }
          } else {
            console.warn(`[webhooks/stripe] No email provided, skipping customer email`)
          }

          // Send notification email to admin
          try {
            const adminEmail = process.env.ADMIN_EMAIL || 'visitmakkah@visit-makkah.fr'
            console.log(`[webhooks/stripe] Sending admin notification email to ${adminEmail}`)
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
                
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0">
                  <h3 style="margin:0 0 12px 0;color:#991b1b">Informations de la commande</h3>
                  <p style="margin:4px 0"><strong>Numéro de commande:</strong> ${order.orderNumber}</p>
                  <p style="margin:4px 0"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</p>
                  <p style="margin:4px 0"><strong>Statut:</strong> <span style="color:#16a34a;font-weight:600">PAYÉ</span></p>
                  ${reservationDateStr ? `<p style="margin:4px 0"><strong>Date de réservation:</strong> ${reservationDateStr}</p>` : ''}
                  ${paymentIntentId ? `<p style="margin:4px 0"><strong>Payment Intent ID:</strong> ${paymentIntentId}</p>` : ''}
                </div>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
                  <h3 style="margin:0 0 12px 0;color:#1a1a1a">Informations client</h3>
                  <p style="margin:4px 0"><strong>Nom:</strong> ${name || '—'}</p>
                  <p style="margin:4px 0"><strong>Email:</strong> ${email || '—'}</p>
                  <p style="margin:4px 0"><strong>Téléphone:</strong> ${phone || '—'}</p>
                </div>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
                  <h3 style="margin:0 0 12px 0;color:#1a1a1a">Articles commandés</h3>
                  <pre style="white-space:pre-wrap;font-family:inherit;margin:0">${itemsList}</pre>
                </div>

                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0">
                  <p style="margin:0;font-size:18px;font-weight:600;color:#991b1b">
                    <strong>Total: ${orderTotal}${currencySymbol}</strong>
                  </p>
                </div>
              </div>
            `

            const textAdmin = `🛒 Nouvelle commande payée

Informations de la commande:
- Numéro de commande: ${order.orderNumber}
- Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}
- Statut: PAYÉ
${reservationDateStr ? `- Date de réservation: ${reservationDateStr}\n` : ''}
${paymentIntentId ? `- Payment Intent ID: ${paymentIntentId}\n` : ''}

Informations client:
- Nom: ${name || '—'}
- Email: ${email || '—'}
- Téléphone: ${phone || '—'}

Articles commandés:
${itemsList}

Total: ${orderTotal}${currencySymbol}`

            await sendMail({
              to: adminEmail,
              subject: `[Nouvelle commande] ${order.orderNumber} - ${orderTotal}${currencySymbol}`,
              html: htmlAdmin,
              text: textAdmin,
              replyTo: email || undefined,
            })
            console.log(`[webhooks/stripe] Admin email sent successfully to ${adminEmail}`)
          } catch (emailError) {
            console.error('[webhooks/stripe] Failed to send admin email:', emailError)
            // Don't fail the webhook if email fails
          }
          
          console.log(`[webhooks/stripe] Successfully processed order ${order.orderNumber}`)
        } else {
          console.warn(`[webhooks/stripe] No orderId found in session metadata`)
        }
        break
      }
      case 'customer.created':
      case 'customer.updated': {
        // Ces événements sont reçus mais ne nécessitent pas d'action spécifique
        console.log(`[webhooks/stripe] Event ${event.type} received but not processed (no action needed)`)
        break
      }
      default: {
        // Ignore other events for now
        console.log(`[webhooks/stripe] Unhandled event type: ${event.type}`)
        break
      }
    }
    return new Response('OK', { status: 200 })
  } catch (err: unknown) {
    console.error('[webhooks/stripe] handler error', err)
    return new Response('Webhook handler error', { status: 500 })
  }
}
