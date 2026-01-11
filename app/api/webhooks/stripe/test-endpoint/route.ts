import { NextRequest } from 'next/server'

/**
 * Endpoint de test pour vérifier que le webhook est accessible
 * Accès: GET /api/webhooks/stripe/test-endpoint
 */
export async function GET(req: NextRequest) {
  return Response.json({
    success: true,
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: 'GET',
    note: 'Stripe will use POST method, but GET confirms the endpoint exists',
  })
}

/**
 * Endpoint de test pour vérifier que le webhook accepte les requêtes POST
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')
  
  return Response.json({
    success: true,
    message: 'Webhook endpoint accepts POST requests',
    timestamp: new Date().toISOString(),
    hasSignature: !!signature,
    note: 'This is a test. Real webhook events will have a Stripe signature.',
  })
}

