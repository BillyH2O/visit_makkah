import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { calculateOrderAmounts } from '@/lib/pricing'

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'
}

/**
 * Convertit le HTML en texte brut en supprimant les balises HTML
 * et en préservant le contenu textuel de manière lisible
 */
function stripHtmlTags(html: string): string {
  if (!html) return ''
  
  // Remplacer les listes par du texte formaté
  const text = html
    // Convertir <ul> en saut de ligne
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    // Convertir <li> en puces
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    // Convertir <p> en saut de ligne
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    // Convertir <br> en saut de ligne
    .replace(/<br\s*\/?>/gi, '\n')
    // Convertir <strong> et <b> en texte gras (markdown)
    .replace(/<(strong|b)[^>]*>/gi, '**')
    .replace(/<\/(strong|b)>/gi, '**')
    // Convertir <em> et <i> en texte italique (markdown)
    .replace(/<(em|i)[^>]*>/gi, '_')
    .replace(/<\/(em|i)>/gi, '_')
    // Supprimer toutes les autres balises HTML
    .replace(/<[^>]+>/g, '')
    // Décoder les entités HTML
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Nettoyer les espaces multiples et sauts de ligne
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
  
  return text
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
        pricePeriods: {
          where: { isActive: true },
          orderBy: { startDate: 'asc' },
        },
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
    // Logique de tarification :
    // - OFFRE (Formules) et SERVICE (Services) : acompte modifiable (défaut 20%)
    // - VISA et SADAQA : paiement total (100%, pas d'acompte)
    const [depositEnabledSetting, depositPercentSetting] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: 'depositEnabled' } }),
      prisma.siteSetting.findUnique({ where: { key: 'depositPercent' } }),
    ])
    const categoryCode = product.category?.code
    const isVisaCategory = categoryCode === 'VISA'
    const isSadaqaCategory = categoryCode === 'SADAQA'
    // Transport = catégorie SERVICE, mais l'unité est "véhicule" (pas "personne")
    const isTransportService =
      categoryCode === 'SERVICE' &&
      (product.name.toLowerCase().includes('transport') ||
        product.name.toLowerCase().includes('hôtel') ||
        product.name.toLowerCase().includes('vehicule') ||
        product.name.toLowerCase().includes('véhicule'))

    // Unité affichée côté Stripe (emails/reçu Stripe)
    const unitLabelLong = isSadaqaCategory ? 'Quantité' : isTransportService ? 'Véhicules' : 'Personnes'
    const unitLabelShort = isSadaqaCategory ? 'qté' : isTransportService ? 'véh.' : 'pers.'
    const depositEnabled = depositEnabledSetting?.value != null ? depositEnabledSetting.value === 'true' : true
    const depositPercentRaw = depositPercentSetting?.value != null ? Number.parseFloat(depositPercentSetting.value) : 20
    const depositPercent = Number.isFinite(depositPercentRaw) ? Math.min(100, Math.max(1, Math.round(depositPercentRaw))) : 20
    // VISA et SADAQA paient toujours la totalité (pas d'acompte)
    // Pour OFFRE et SERVICE : applique le pourcentage d'acompte si activé
    // Tous les services (y compris les transports) utilisent le même pourcentage d'acompte configuré
    const depositFactor = (!isVisaCategory && !isSadaqaCategory && depositEnabled) ? depositPercent / 100 : 1

    // Compute optional per-person surcharge based on metadata
    const meta = (product.metadata as { includedPeople?: number; extraPerPersonCents?: number } | null) || {}
    const includedPeople = typeof meta.includedPeople === 'number' ? meta.includedPeople : 0
    const baseExtraPerPersonCents = typeof meta.extraPerPersonCents === 'number' ? meta.extraPerPersonCents : 0
    const groupSize = typeof peopleCount === 'number' && peopleCount > 0 ? peopleCount : 1
    
    // Chercher une période de prix applicable si une date de réservation est fournie
    let applicableUnitAmount = defaultPrice.unitAmount
    let extraPerPersonCents = baseExtraPerPersonCents
    let periodName: string | null = null
    
    if (reservationDate) {
      const targetDate = new Date(reservationDate)
      if (!isNaN(targetDate.getTime())) {
        const applicablePeriod = product.pricePeriods.find(period => {
          const start = new Date(period.startDate)
          const end = new Date(period.endDate)
          start.setHours(0, 0, 0, 0)
          end.setHours(23, 59, 59, 999)
          const target = new Date(targetDate)
          target.setHours(12, 0, 0, 0)
          return target >= start && target <= end
        })
        
        if (applicablePeriod) {
          applicableUnitAmount = applicablePeriod.unitAmount
          periodName = applicablePeriod.name
          // Utiliser extraPerPersonCents de la période si défini, sinon celui du produit
          if (applicablePeriod.extraPerPersonCents != null) {
            extraPerPersonCents = applicablePeriod.extraPerPersonCents
          }
        }
      }
    }
    
    // Calcul des montants avec la logique centralisée
    const baseUnitAmountDeposit = Math.round(applicableUnitAmount * depositFactor)
    const extraUnitAmountDeposit = Math.round(extraPerPersonCents * depositFactor)
    
    const { baseAmount, extraAmount, baseUnits, extraUnits } = calculateOrderAmounts(
      baseUnitAmountDeposit,
      groupSize,
      quantity,
      includedPeople,
      extraUnitAmountDeposit
    )
    
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
      // Méthodes de paiement disponibles
      // Note: Pour activer PayPal, il faut d'abord l'activer dans le Dashboard Stripe
      // https://dashboard.stripe.com/account/payments/settings
      payment_method_types: ['card'],
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
              name: periodName ? `${product.name} (${periodName})` : product.name,
              description: (() => {
                const baseDesc = stripHtmlTags(product.description || '')
                const depositText = depositFactor < 1 
                  ? `\n\n* Paiement de ${depositPercent}% d'acompte. Le reste sera à payer sur place.`
                  : ''
                const fullDesc = baseDesc + depositText
                return fullDesc.trim() || undefined
              })(),
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
                      name: `Supplément ${unitLabelLong.toLowerCase()}`,
                      description: (() => {
                        const baseDesc = includedPeople > 0
                          ? `Inclus: ${includedPeople} ${unitLabelShort} × ${(applicableUnitAmount / 100).toFixed(0)}€ | Supplément: ${extraUnits} ${unitLabelShort} × ${(extraPerPersonCents / 100).toFixed(0)}€`
                          : `${extraUnits} x ${(extraPerPersonCents / 100).toFixed(0)}€`
                        const depositText = depositFactor < 1 
                          ? `\n\n* Paiement de ${depositPercent}% d'acompte. Le reste sera à payer sur place.`
                          : ''
                        return baseDesc + depositText
                      })(),
                    },
                  },
                },
              ]
            : []
        ),
      ],
      success_url: success,
      cancel_url: cancel,
      metadata: { 
        orderId: order.id, 
        orderNumber: order.orderNumber, 
        productId: product.id, 
        peopleCount: String(groupSize), 
        depositFactor: String(depositFactor),
        categoryCode: categoryCode || '',
      },
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
