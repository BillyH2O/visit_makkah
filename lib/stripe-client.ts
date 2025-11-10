import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Client Stripe côté client (pour le navigateur)
 * Utilise un singleton pour éviter de créer plusieurs instances
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
      return Promise.resolve(null)
    }
    
    stripePromise = loadStripe(publishableKey)
  }
  
  return stripePromise
}

