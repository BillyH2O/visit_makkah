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
        const sessionProductId: string | undefined = (session.metadata as Record<string, string> | null | undefined)?.productId
        const email: string | undefined = session.customer_details?.email || session.customer_email || undefined
        const name: string | undefined = session.customer_details?.name || undefined
        const phone: string | undefined = session.customer_details?.phone || undefined
        const paymentIntentId: string | undefined = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || undefined
        const peopleCount: string | undefined = (session.metadata as Record<string, string> | null | undefined)?.peopleCount
        const metadataCategoryCode: string | undefined = (session.metadata as Record<string, string> | null | undefined)?.categoryCode

        console.log(`[webhooks/stripe] Order ID: ${orderId}, Email: ${email}, Name: ${name}`)
        console.log(`[webhooks/stripe] Session metadata:`, JSON.stringify(session.metadata, null, 2))
        console.log(`[webhooks/stripe] Payment status: ${session.payment_status}, Session status: ${session.status}`)

        if (!orderId) {
          console.error(`[webhooks/stripe] ❌ No orderId found in session metadata`)
          console.error(`[webhooks/stripe] Session metadata keys:`, Object.keys(session.metadata || {}))
          return new Response('No orderId in metadata', { status: 400 })
        }

        // Upsert customer if email is provided
        let customerId: string | undefined
        if (email) {
          try {
          const customer = await prisma.customer.upsert({
            where: { email },
            create: { email, name: name || null, phone: phone || null },
            update: { name: name || undefined, phone: phone || undefined },
          })
          customerId = customer.id
            console.log(`[webhooks/stripe] Customer upserted: ${customerId}`)
          } catch (customerError) {
            console.error(`[webhooks/stripe] Failed to upsert customer:`, customerError)
          }
        }

          // Get order to check if it has a reservation date
        let order
        try {
          order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: { include: { category: true } } } } },
          })
        } catch (orderError) {
          console.error(`[webhooks/stripe] Failed to fetch order:`, orderError)
          return new Response('Failed to fetch order', { status: 500 })
        }

        if (!order) {
          console.error(`[webhooks/stripe] ❌ Order not found: ${orderId}`)
          return new Response(`Order not found: ${orderId}`, { status: 404 })
        }

        console.log(`[webhooks/stripe] Order found: ${order.orderNumber}, Current status: ${order.status}`)
        console.log(`[webhooks/stripe] Order has reservationDate: ${!!order.reservationDate}, reservationDate: ${order.reservationDate || 'null'}`)
        console.log(`[webhooks/stripe] Order items count: ${order.items.length}`)

        // Determine label reliably for emails (use productId from Stripe session when possible)
        const firstItem = order.items[0]
        let dbCategoryCode: string | undefined
        let dbProductName: string | undefined
        if (sessionProductId) {
          try {
            const p = await prisma.product.findUnique({
              where: { id: sessionProductId },
              include: { category: true },
            })
            dbCategoryCode = p?.category?.code
            dbProductName = p?.name
          } catch (e) {
            console.error('[webhooks/stripe] Failed to load product/category for label:', e)
          }
        }

        const productCategoryCode =
          dbCategoryCode || firstItem?.product?.category?.code || metadataCategoryCode || undefined
        const productName = (dbProductName || firstItem?.product?.name || '').toString()
        const itemName = (firstItem?.name || '').toString()

        console.log(`[webhooks/stripe] DEBUG - dbCategoryCode: "${dbCategoryCode}", firstItem?.product?.category?.code: "${firstItem?.product?.category?.code}", metadataCategoryCode: "${metadataCategoryCode}"`)
        console.log(`[webhooks/stripe] DEBUG - productCategoryCode final: "${productCategoryCode}"`)
        
        const isSadaqa = productCategoryCode === 'SADAQA'
        const isTransport =
          productCategoryCode === 'SERVICE' &&
          (productName.toLowerCase().includes('hôtel') ||
            productName.toLowerCase().includes('transport') ||
            productName.toLowerCase().includes('vehicule') ||
            productName.toLowerCase().includes('véhicule') ||
            itemName.toLowerCase().includes('hôtel') ||
            itemName.toLowerCase().includes('transport') ||
            itemName.toLowerCase().includes('vehicule') ||
            itemName.toLowerCase().includes('véhicule'))
        
        console.log(`[webhooks/stripe] DEBUG - isSadaqa: ${isSadaqa}, isTransport: ${isTransport}`)

        const quantityLabel = isSadaqa ? 'Quantité' : isTransport ? 'Quantité' : 'Nombre de personnes'

        console.log(
          `[webhooks/stripe] Product detection - sessionProductId: ${sessionProductId || 'none'}, category: ${productCategoryCode || 'unknown'}, quantityLabel: "${quantityLabel}"`
        )

          // Update order status
        try {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
              email: email || undefined,
              stripePaymentIntentId: paymentIntentId || undefined,
              ...(customerId ? { customer: { connect: { id: customerId } } } : {}),
            },
          })
          console.log(`[webhooks/stripe] ✅ Order status updated to PAID: ${order.orderNumber}`)
        } catch (updateError) {
          console.error(`[webhooks/stripe] ❌ Failed to update order status:`, updateError)
          throw updateError
        }

        // Create Stripe Invoice and send automatically
        if (session.payment_status === 'paid' && session.customer) {
          try {
            const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer.id
            console.log(`[webhooks/stripe] 🧾 Creating Stripe Invoice for customer: ${stripeCustomerId}`)

            // Create invoice items from order items
            // These will be automatically included in the next invoice created for this customer
            await Promise.all(
              order.items.map(async (item) => {
                await stripe.invoiceItems.create({
                  customer: stripeCustomerId,
                  amount: item.unitAmount * item.quantity, // Total amount for this line item
                  currency: item.currency.toLowerCase(),
                  description: `${item.name} × ${item.quantity}`,
                })
              })
            )

            console.log(`[webhooks/stripe] Created ${order.items.length} invoice items`)

            // Create invoice (it will automatically include pending invoice items)
            const invoice = await stripe.invoices.create({
              customer: stripeCustomerId,
              auto_advance: false, // We'll finalize manually to control sending
              collection_method: 'charge_automatically',
              description: `Facture pour la commande ${order.orderNumber}`,
              metadata: {
                orderId: order.id,
                orderNumber: order.orderNumber,
              },
            })

            console.log(`[webhooks/stripe] Invoice created: ${invoice.id}`)

            // Finalize the invoice (this makes it ready to send)
            const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)

            console.log(`[webhooks/stripe] ✅ Invoice finalized: ${finalizedInvoice.id}, status: ${finalizedInvoice.status}`)

            // Send the invoice to the customer
            // Stripe will automatically attach the PDF and send it via email
            await stripe.invoices.sendInvoice(finalizedInvoice.id)
            console.log(`[webhooks/stripe] ✅ Invoice sent automatically to customer: ${email || stripeCustomerId}`)
          } catch (invoiceError) {
            console.error(`[webhooks/stripe] ⚠️ Failed to create/send Stripe Invoice:`, invoiceError)
            // Don't throw - invoice failure shouldn't block order processing
            // The order is already marked as PAID, so we continue
          }
        } else {
          console.log(`[webhooks/stripe] ⚠️ Skipping invoice creation - payment_status: ${session.payment_status}, customer: ${session.customer ? 'present' : 'missing'}`)
        }

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
            console.log(`[webhooks/stripe] 📅 Reservation date found: ${order.reservationDate}, attempting to create Google Calendar event`)
            // Vérifier la configuration Google Calendar
            const googleCalendarConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN)
            console.log(`[webhooks/stripe] Google Calendar configuration check:`)
            console.log(`[webhooks/stripe]   GOOGLE_CLIENT_ID: ${!!process.env.GOOGLE_CLIENT_ID} (${process.env.GOOGLE_CLIENT_ID ? 'present' : 'missing'})`)
            console.log(`[webhooks/stripe]   GOOGLE_CLIENT_SECRET: ${!!process.env.GOOGLE_CLIENT_SECRET} (${process.env.GOOGLE_CLIENT_SECRET ? 'present' : 'missing'})`)
            console.log(`[webhooks/stripe]   GOOGLE_REFRESH_TOKEN: ${!!process.env.GOOGLE_REFRESH_TOKEN} (${process.env.GOOGLE_REFRESH_TOKEN ? 'present' : 'missing'})`)
            console.log(`[webhooks/stripe]   googleCalendarConfigured: ${googleCalendarConfigured}`)
            
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
              console.log(`[webhooks/stripe] ✅ Google Calendar is configured, creating event...`)
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

              console.log(`[webhooks/stripe] ✅ Google Calendar event created successfully for order ${order.orderNumber}`)
            } catch (calendarError) {
              console.error('[webhooks/stripe] ❌ Failed to create Google Calendar event:', calendarError)
              if (calendarError instanceof Error) {
                console.error('[webhooks/stripe] Error message:', calendarError.message)
                console.error('[webhooks/stripe] Error stack:', calendarError.stack)
              }
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
            const totalPeople = peopleCount || order.items.reduce((sum, item) => sum + item.quantity, 0).toString()
            
            console.log(`[webhooks/stripe] Email - Using quantityLabel: "${quantityLabel}" for product: ${productName}, category: ${productCategoryCode}`)

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
                  ${totalPeople ? `<p style="margin:4px 0"><strong>${quantityLabel}:</strong> ${totalPeople}</p>` : ''}
                </div>

                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
                  <h3 style="margin:0 0 12px 0;color:#1a1a1a">Vos informations de contact</h3>
                  <p style="margin:4px 0"><strong>Email:</strong> ${email || '—'}</p>
                  ${phone ? `<p style="margin:4px 0"><strong>Téléphone:</strong> ${phone}</p>` : ''}
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
${totalPeople ? `- ${quantityLabel}: ${totalPeople}\n` : ''}

Vos informations de contact:
- Email: ${email || '—'}
${phone ? `- Téléphone: ${phone}\n` : ''}

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

          const totalPeople = peopleCount || order.items.reduce((sum, item) => sum + item.quantity, 0).toString()

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
                ${totalPeople ? `<p style="margin:4px 0"><strong>${quantityLabel}:</strong> ${totalPeople}</p>` : ''}
                ${paymentIntentId ? `<p style="margin:4px 0"><strong>Payment Intent ID:</strong> ${paymentIntentId}</p>` : ''}
              </div>

              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
                <h3 style="margin:0 0 12px 0;color:#1a1a1a">Informations client</h3>
                <p style="margin:4px 0"><strong>Nom:</strong> ${name || '—'}</p>
                <p style="margin:4px 0"><strong>Email:</strong> ${email ? `<a href="mailto:${email}">${email}</a>` : '—'}</p>
                <p style="margin:4px 0"><strong>Téléphone:</strong> ${phone ? `<a href="tel:${phone}">${phone}</a>` : '—'}</p>
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
${totalPeople ? `- ${quantityLabel}: ${totalPeople}\n` : ''}
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
