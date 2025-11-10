"use client"
import { useEffect, useState } from 'react'
import type { ProductDTO } from '@/types/product'

type UseProductsOptions = {
  limit?: number
  isPremium?: boolean
  isHighlight?: boolean
}

export function useProductsByCategory(category: 'OFFRE' | 'SADAQA' | 'VISA' | 'SERVICE', options?: UseProductsOptions) {
  const [data, setData] = useState<ProductDTO[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('category', category)
        if (options?.limit) params.set('limit', String(options.limit))
        if (typeof options?.isPremium === 'boolean') params.set('isPremium', String(options.isPremium))
        if (typeof options?.isHighlight === 'boolean') params.set('isHighlight', String(options.isHighlight))
        const res = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
        if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`)
        const json = await res.json()
        if (!cancelled) setData(json.products as ProductDTO[])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Failed to fetch products'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [category, options?.limit, options?.isPremium, options?.isHighlight])

  return { data, loading, error }
}


