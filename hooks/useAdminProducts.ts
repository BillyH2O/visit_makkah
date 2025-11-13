"use client"
import { useEffect, useState } from 'react'
import type { CategoryCode } from '@/types/product'

export type AdminProduct = {
  id: string
  name: string
  description?: string | null
  landingTitle?: string | null
  landingBio?: string | null
  landingGradientClassName?: string | null
  landingImageUrl?: string | null
  detailTitle?: string | null
  longDescriptionHtml?: string | null
  detailColorHex?: string | null
  isPremium: boolean
  active: boolean
  price?: number
  firstPrice?: number
  imageUrl?: string
  categoryCode: CategoryCode
  metadata?: { infoLabel?: string; includedPeople?: number; extraPerPersonCents?: number; imageClassName?: string } | null
}

export function useAdminProducts(category?: CategoryCode) {
  const [data, setData] = useState<AdminProduct[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const params = category ? `?category=${category}` : ''
        const res = await fetch(`/api/admin/products${params}`)
        if (!res.ok) throw new Error('Failed to fetch products')
        const json = await res.json()
        const mapped = json.products.map((p: {
          id: string
          name: string
          description?: string | null
          landingTitle?: string | null
          landingBio?: string | null
          landingGradientClassName?: string | null
          landingImageUrl?: string | null
          detailTitle?: string | null
          longDescriptionHtml?: string | null
          detailColorHex?: string | null
          isPremium: boolean
          active: boolean
          metadata?: { infoLabel?: string; includedPeople?: number; extraPerPersonCents?: number; imageClassName?: string } | null
          prices: Array<{ unitAmount?: number | null; compareAtUnitAmount?: number | null }>
          images: Array<{ url: string }>
          category: { code: CategoryCode }
        }) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          landingTitle: p.landingTitle,
          landingBio: p.landingBio,
          landingGradientClassName: p.landingGradientClassName,
          landingImageUrl: p.landingImageUrl,
          detailTitle: p.detailTitle,
          longDescriptionHtml: p.longDescriptionHtml,
          detailColorHex: p.detailColorHex,
          isPremium: p.isPremium,
          active: p.active,
          metadata: p.metadata,
          price: p.prices[0]?.unitAmount ? p.prices[0].unitAmount / 100 : undefined,
          firstPrice: p.prices[0]?.compareAtUnitAmount ? p.prices[0].compareAtUnitAmount / 100 : undefined,
          imageUrl: p.images[0]?.url,
          categoryCode: p.category.code,
        }))
        if (!cancelled) setData(mapped)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Failed to fetch products'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [category])

  const updateProduct = async (id: string, data: Partial<AdminProduct>) => {
    const res = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })
    if (!res.ok) throw new Error('Failed to update product')
    const json = await res.json()
    // Update local state
    setData((prev) =>
      prev?.map((p) => (p.id === id ? { ...p, ...data, price: data.price, firstPrice: data.firstPrice } : p)) || null
    )
    return json.product
  }

  const refetch = () => {
    setData(null)
    setLoading(true)
  }

  return { data, loading, error, updateProduct, refetch }
}

