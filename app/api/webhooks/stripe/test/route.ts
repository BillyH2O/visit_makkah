import { NextRequest } from 'next/server'

/**
 * Endpoint de test pour vérifier la configuration du webhook
 * Accès: GET /api/webhooks/stripe/test
 */
export async function GET(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  return Response.json({
    webhookSecretConfigured: !!webhookSecret,
    webhookSecretLength: webhookSecret?.length || 0,
    webhookSecretPrefix: webhookSecret?.substring(0, 5) || 'none',
    message: webhookSecret 
      ? '✅ STRIPE_WEBHOOK_SECRET est configuré' 
      : '❌ STRIPE_WEBHOOK_SECRET n\'est pas configuré',
    instructions: {
      step1: 'Vérifiez dans Stripe Dashboard → Webhooks qu\'un endpoint existe',
      step2: 'Vérifiez que l\'URL du webhook pointe vers: https://votre-domaine.com/api/webhooks/stripe',
      step3: 'Vérifiez que l\'événement "checkout.session.completed" est sélectionné',
      step4: 'En local, utilisez ngrok pour exposer votre serveur',
      step5: 'Vérifiez les logs du serveur pour voir si le webhook est appelé',
    }
  })
}

