import { NextRequest } from 'next/server'

/**
 * Endpoint de diagnostic complet pour vérifier la configuration
 * Accès: GET /api/webhooks/stripe/diagnostic
 */
export async function GET(req: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    summary: {
      webhook: 'unknown',
      email: 'unknown',
      googleCalendar: 'unknown',
    },
  }

  // 1. Vérification du webhook secret
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  diagnostics.checks.webhookSecret = {
    configured: !!webhookSecret,
    length: webhookSecret?.length || 0,
    prefix: webhookSecret?.substring(0, 5) || 'none',
    status: webhookSecret ? '✅ Configuré' : '❌ Manquant',
  }
  diagnostics.summary.webhook = webhookSecret ? 'ok' : 'missing'

  // 2. Vérification SMTP (Email)
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD
  const adminEmail = process.env.ADMIN_EMAIL

  diagnostics.checks.email = {
    smtpHost: {
      configured: !!smtpHost,
      value: smtpHost ? `${smtpHost.substring(0, 10)}...` : 'non configuré',
      status: smtpHost ? '✅' : '❌',
    },
    smtpPort: {
      configured: !!smtpPort,
      value: smtpPort || 'non configuré',
      status: smtpPort ? '✅' : '❌',
    },
    smtpUser: {
      configured: !!smtpUser,
      value: smtpUser ? `${smtpUser.substring(0, 10)}...` : 'non configuré',
      status: smtpUser ? '✅' : '❌',
    },
    smtpPassword: {
      configured: !!smtpPassword,
      length: smtpPassword?.length || 0,
      status: smtpPassword ? '✅' : '❌',
    },
    adminEmail: {
      configured: !!adminEmail,
      value: adminEmail || 'non configuré',
      status: adminEmail ? '✅' : '❌',
    },
    allConfigured: !!(smtpHost && smtpPort && smtpUser && smtpPassword && adminEmail),
  }
  diagnostics.summary.email = diagnostics.checks.email.allConfigured ? 'ok' : 'missing'

  // 3. Vérification Google Calendar
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
  const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN

  diagnostics.checks.googleCalendar = {
    clientId: {
      configured: !!googleClientId,
      status: googleClientId ? '✅' : '❌',
    },
    clientSecret: {
      configured: !!googleClientSecret,
      status: googleClientSecret ? '✅' : '❌',
    },
    refreshToken: {
      configured: !!googleRefreshToken,
      length: googleRefreshToken?.length || 0,
      prefix: googleRefreshToken?.substring(0, 5) || 'none',
      status: googleRefreshToken ? '✅' : '❌',
    },
    allConfigured: !!(googleClientId && googleClientSecret && googleRefreshToken),
  }
  diagnostics.summary.googleCalendar = diagnostics.checks.googleCalendar.allConfigured ? 'ok' : 'missing'

  // 4. Messages d'aide
  diagnostics.help = {
    webhook: !webhookSecret
      ? 'Ajoutez STRIPE_WEBHOOK_SECRET dans votre .env (trouvable dans Stripe Dashboard → Webhooks → Signing secret)'
      : '✅ Webhook secret configuré',
    email: !diagnostics.checks.email.allConfigured
      ? 'Configurez toutes les variables SMTP dans .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, ADMIN_EMAIL'
      : '✅ Configuration email complète',
    googleCalendar: !diagnostics.checks.googleCalendar.allConfigured
      ? 'Configurez Google Calendar dans .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN (voir docs/GOOGLE_CALENDAR_SETUP.md)'
      : '✅ Configuration Google Calendar complète',
  }

  // 5. Vérification si le webhook est appelé
  diagnostics.instructions = {
    step1: 'Vérifiez les logs du serveur lors d\'un paiement test',
    step2: 'Cherchez les messages commençant par [webhooks/stripe]',
    step3: 'Si vous ne voyez aucun log [webhooks/stripe], le webhook n\'est pas appelé',
    step4: 'Vérifiez dans Stripe Dashboard → Webhooks → Recent events si des événements sont envoyés',
    step5: 'Si des événements apparaissent mais échouent, vérifiez les logs pour les erreurs',
  }

  return Response.json(diagnostics, { status: 200 })
}



