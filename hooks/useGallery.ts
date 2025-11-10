"use client"
import { useEffect, useState } from 'react'

export type GalleryItem = { id: string; type: string; title?: string; desc?: string; url: string; span?: string }

export function useGalleryItems() {
  const [data, setData] = useState<GalleryItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/gallery', { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to fetch gallery')
        const json = await res.json()
        if (!cancelled) setData(json.items)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Failed to fetch gallery'))
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


