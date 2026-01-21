import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'

/**
 * Endpoint de test pour vérifier la configuration du webhook
 * Accès: GET /api/webhooks/stripe/test
 * 
 * Cet endpoint vérifie :
 * 1. Si STRIPE_WEBHOOK_SECRET est configuré
 * 2. Liste les webhooks configurés dans votre compte Stripe
 * 3. Vérifie si l'URL de production correspond à un webhook existant
 */

interface LocalConfig {
  webhookSecretConfigured: boolean
  webhookSecretLength: number
  webhookSecretPrefix: string
  expectedWebhookUrl: string
  message: string
}

interface Instructions {
  step1: string
  step2: string
  step3: string
  step4: string
  step5: string
}

interface WebhookInfo {
  id: string
  url: string
  status: string
  enabledEvents: string[]
  isProductionUrl: boolean
  matchesExpectedUrl: boolean
}

interface StripeWebhooksResult {
  count?: number
  webhooks?: WebhookInfo[]
  message: string
  error?: boolean
  errorMessage?: string
  hint?: string
  example?: string
}

interface MatchResult {
  found: boolean
  webhookId?: string
  webhookUrl?: string
  hasCheckoutSessionCompleted?: boolean
  status?: string
  message: string
  suggestion?: string
}

interface TestResult {
  localConfig: LocalConfig
  instructions: Instructions
  stripeWebhooks?: StripeWebhooksResult
  match?: MatchResult
}

export async function GET(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const { searchParams } = new URL(req.url)
  const checkStripe = searchParams.get('check_stripe') === 'true'
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const expectedWebhookUrl = `${baseUrl.replace(/\/$/, '')}/api/webhooks/stripe`
  
  const result: TestResult = {
    localConfig: {
      webhookSecretConfigured: !!webhookSecret,
      webhookSecretLength: webhookSecret?.length || 0,
      webhookSecretPrefix: webhookSecret?.substring(0, 5) || 'none',
      expectedWebhookUrl,
      message: webhookSecret 
        ? '✅ STRIPE_WEBHOOK_SECRET est configuré localement' 
        : '❌ STRIPE_WEBHOOK_SECRET n\'est pas configuré dans .env',
    },
    instructions: {
      step1: 'Vérifiez dans Stripe Dashboard → Webhooks qu\'un endpoint existe',
      step2: `Vérifiez que l'URL du webhook pointe vers: ${expectedWebhookUrl}`,
      step3: 'Vérifiez que l\'événement "checkout.session.completed" est sélectionné',
      step4: 'En local, utilisez Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe',
      step5: 'Vérifiez les logs du serveur pour voir si le webhook est appelé',
    }
  }

  // Optionnel : vérifier les webhooks dans Stripe (nécessite les credentials Stripe)
  if (checkStripe) {
    try {
      const webhooks = await stripe.webhookEndpoints.list({ limit: 10 })
      
      result.stripeWebhooks = {
        count: webhooks.data.length,
        webhooks: webhooks.data.map(wh => ({
          id: wh.id,
          url: wh.url,
          status: wh.status,
          enabledEvents: wh.enabled_events,
          isProductionUrl: wh.url.includes(baseUrl.replace('http://', 'https://').replace('localhost', '')),
          matchesExpectedUrl: wh.url === expectedWebhookUrl || wh.url.includes('/api/webhooks/stripe'),
        })),
        message: webhooks.data.length === 0
          ? '⚠️ Aucun webhook trouvé dans votre compte Stripe'
          : `✅ ${webhooks.data.length} webhook(s) trouvé(s)`,
      }

      // Vérifier si un webhook correspond à l'URL attendue
      const matchingWebhook = webhooks.data.find(wh => 
        wh.url === expectedWebhookUrl || 
        wh.url.includes('/api/webhooks/stripe')
      )

      if (matchingWebhook) {
        result.match = {
          found: true,
          webhookId: matchingWebhook.id,
          webhookUrl: matchingWebhook.url,
          hasCheckoutSessionCompleted: matchingWebhook.enabled_events.includes('checkout.session.completed'),
          status: matchingWebhook.status,
          message: matchingWebhook.status === 'enabled'
            ? '✅ Webhook trouvé et activé !'
            : `⚠️ Webhook trouvé mais statut: ${matchingWebhook.status}`,
        }
      } else {
        result.match = {
          found: false,
          message: '❌ Aucun webhook ne correspond à l\'URL attendue',
          suggestion: `Créez un webhook dans Stripe Dashboard avec l'URL: ${expectedWebhookUrl}`,
        }
      }
    } catch (error) {
      result.stripeWebhooks = {
        error: true,
        message: 'Erreur lors de la récupération des webhooks depuis Stripe',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Vérifiez que STRIPE_SECRET_KEY est configuré dans .env',
      }
    }
  } else {
    result.stripeWebhooks = {
      message: 'Pour vérifier les webhooks dans Stripe, ajoutez ?check_stripe=true à l\'URL',
      example: `${req.url}?check_stripe=true`,
    }
  }
  
  return Response.json(result, { status: 200 })
}
