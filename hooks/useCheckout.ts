"use client"

import { useCallback, useState } from 'react'

export type StartCheckoutOptions = {
  quantity?: number
  successUrl?: string
  cancelUrl?: string
  customerEmail?: string
  peopleCount?: number
}

export function useCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = useCallback(async (productId: string, opts?: StartCheckoutOptions) => {
    setLoading(true)
    setError(null)
    try {
      console.debug('[useCheckout] start', { productId, opts })
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, ...opts }),
      })
      if (!res.ok) {
        const text = await res.text()
        console.error('[useCheckout] API error', res.status, text)
        throw new Error(text || 'Failed to create checkout session')
      }
      const json = await res.json()
      console.debug('[useCheckout] session created', json)
      const url: string | undefined = json.url
      if (!url) throw new Error('No checkout URL returned')
      window.location.href = url
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Checkout failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return { startCheckout, loading, error }
}
