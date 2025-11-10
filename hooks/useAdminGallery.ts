"use client"
import { useEffect, useState } from 'react'

export type GalleryItem = {
  id: string
  type: string
  title?: string | null
  desc?: string | null
  url: string
  span?: string | null
  isActive: boolean
  sortOrder: number
}

export function useAdminGallery() {
  const [data, setData] = useState<GalleryItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/gallery')
        if (!res.ok) throw new Error('Failed to fetch gallery')
        const json = await res.json()
        if (!cancelled) setData(json.items)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Failed to fetch gallery'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  const create = async (data: Partial<GalleryItem>) => {
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create gallery item')
    const json = await res.json()
    setData((prev) => [...(prev || []), json.item])
    return json.item
  }

  const update = async (id: string, data: Partial<GalleryItem>) => {
    const res = await fetch('/api/admin/gallery', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })
    if (!res.ok) throw new Error('Failed to update gallery item')
    const json = await res.json()
    setData((prev) => prev?.map((item) => (item.id === id ? json.item : item)) || null)
    return json.item
  }

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete gallery item')
    setData((prev) => prev?.filter((item) => item.id !== id) || null)
  }

  return { data, loading, error, create, update, remove }
}

