"use client"
import { useEffect, useState } from 'react'

export type FaqItem = {
  id: string
  question: string
  answer: string
  isActive: boolean
  sortOrder: number
}

export function useAdminFaq() {
  const [data, setData] = useState<FaqItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/faq')
        if (!res.ok) throw new Error('Failed to fetch FAQ')
        const json = await res.json()
        if (!cancelled) setData(json.items)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error('Failed to fetch FAQ'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  const create = async (question: string, answer: string) => {
    const res = await fetch('/api/admin/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer }),
    })
    if (!res.ok) throw new Error('Failed to create FAQ')
    const json = await res.json()
    setData((prev) => [...(prev || []), json.item])
    return json.item
  }

  const update = async (id: string, data: Partial<FaqItem>) => {
    const res = await fetch('/api/admin/faq', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })
    if (!res.ok) throw new Error('Failed to update FAQ')
    const json = await res.json()
    setData((prev) => prev?.map((item) => (item.id === id ? json.item : item)) || null)
    return json.item
  }

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/faq?id=${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete FAQ')
    setData((prev) => prev?.filter((item) => item.id !== id) || null)
  }

  return { data, loading, error, create, update, remove }
}

