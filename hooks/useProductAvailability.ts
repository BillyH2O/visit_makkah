import { useState, useEffect } from 'react'

type ProductAvailability = {
  availableDates: string[]
  unavailableDates: string[]
}

export function useProductAvailability(productId: string | undefined) {
  const [data, setData] = useState<ProductAvailability | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!productId) {
      setData({ availableDates: [], unavailableDates: [] })
      setLoading(false)
      return
    }

    let cancelled = false
    const controller = new AbortController()

    async function fetchAvailability() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/products/${productId}/availability`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch availability (${res.status})`)
        }
        const json = await res.json()
        if (!cancelled) {
          setData({
            availableDates: json.availableDates || [],
            unavailableDates: json.unavailableDates || [],
          })
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Failed to fetch availability'))
          setData({ availableDates: [], unavailableDates: [] })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchAvailability()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [productId])

  return { data, loading, error }
}

