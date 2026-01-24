import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'

type PriceForDate = {
  productId: string
  date: string | null
  unitAmount: number | null
  compareAtAmount: number | null
  extraPerPersonCents: number | null
  periodName: string | null
  isBasePeriod: boolean
  periodId?: string
}

type UseProductPriceForDateReturn = {
  data: PriceForDate | null
  loading: boolean
  error: Error | null
  refetch: (newDate?: Date) => void
}

/**
 * Hook pour récupérer le prix d'un produit pour une date donnée
 * 
 * @param productId - ID du produit
 * @param selectedDate - Date sélectionnée (optionnelle)
 * @returns Le prix applicable pour cette date
 */
export function useProductPriceForDate(
  productId: string | undefined,
  selectedDate: Date | undefined
): UseProductPriceForDateReturn {
  const [data, setData] = useState<PriceForDate | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPrice = useCallback(async (date?: Date) => {
    if (!productId) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let url = `/api/products/${productId}/price-for-date`
      if (date) {
        const dateStr = format(date, 'yyyy-MM-dd')
        url += `?date=${dateStr}`
      }

      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Failed to fetch price (${res.status})`)
      }

      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch price'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchPrice(selectedDate)
  }, [fetchPrice, selectedDate])

  const refetch = useCallback((newDate?: Date) => {
    fetchPrice(newDate ?? selectedDate)
  }, [fetchPrice, selectedDate])

  return { data, loading, error, refetch }
}

