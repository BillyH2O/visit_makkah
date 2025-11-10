"use client"
import { useEffect, useState } from 'react'

export type TestimonialItem = { id: string; text: string; image: string; name: string; role?: string }

export function useTestimonials() {
  const [data, setData] = useState<TestimonialItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/testimonials', { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to fetch testimonials')
        const json = await res.json()
        if (!cancelled) setData(json.items)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Failed to fetch testimonials'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  return { data, loading, error }
}


