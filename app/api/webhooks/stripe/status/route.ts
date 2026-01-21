import { prisma } from '@/lib/prisma'

/**
 * Endpoint pour vérifier le statut des webhooks sans accès aux logs serveur
 * Accès: GET /api/webhooks/stripe/status
 * 
 * Vérifie :
 * 1. Les dernières commandes et leur statut
 * 2. Si les commandes sont passées de PENDING à PAID (signe que le webhook a fonctionné)
 * 3. La configuration actuelle
 */
export async function GET() {
  try {
    // Récupérer les 10 dernières commandes
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        items: true,
        customer: true,
      },
    })

    // Analyser les commandes
    const analysis = {
      totalOrders: recentOrders.length,
      paidOrders: recentOrders.filter(o => o.status === 'PAID').length,
      pendingOrders: recentOrders.filter(o => o.status === 'PENDING').length,
      ordersWithReservationDate: recentOrders.filter(o => o.reservationDate !== null).length,
      recentOrders: recentOrders.map(order => ({
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        email: order.email,
        totalAmount: order.totalAmount / 100,
        currency: order.currency,
        hasReservationDate: !!order.reservationDate,
        reservationDate: order.reservationDate?.toISOString() || null,
        stripeCheckoutSessionId: order.stripeCheckoutSessionId,
        stripePaymentIntentId: order.stripePaymentIntentId,
      })),
    }

    // Vérifier la configuration
    const config = {
      webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD),
      adminEmail: process.env.ADMIN_EMAIL || 'non configuré',
      googleCalendarConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN),
    }

    // Diagnostic
    const diagnostic = {
      webhookLikelyWorking: analysis.paidOrders > 0,
      webhookNotWorking: analysis.pendingOrders > 0 && analysis.paidOrders === 0 && recentOrders.length > 0,
      message: analysis.paidOrders > 0
        ? `✅ Le webhook semble fonctionner : ${analysis.paidOrders} commande(s) payée(s) trouvée(s)`
        : analysis.pendingOrders > 0
        ? `⚠️ ${analysis.pendingOrders} commande(s) en attente. Le webhook ne semble pas mettre à jour le statut.`
        : 'ℹ️ Aucune commande récente trouvée.',
    }

    return Response.json({
      timestamp: new Date().toISOString(),
      analysis,
      config,
      diagnostic,
      instructions: {
        step1: 'Vérifiez dans Stripe Dashboard → Webhooks → Recent events le statut de checkout.session.completed',
        step2: 'Si le statut est "Succeeded", le webhook est appelé mais peut avoir des erreurs',
        step3: 'Si le statut est "Failed", cliquez sur l\'événement pour voir l\'erreur',
        step4: 'Vérifiez que les variables SMTP et Google Calendar sont configurées',
        step5: 'Utilisez /api/webhooks/stripe/diagnostic pour vérifier la configuration complète',
      },
    })
  } catch (error) {
    return Response.json({
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}



