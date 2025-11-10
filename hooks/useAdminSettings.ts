"use client"

import { useEffect, useState } from 'react'

export function useAdminSettings() {
  const [videoSrc, setVideoSrc] = useState<string>('https://www.youtube.com/watch?v=V1RPi2MYptM')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchSetting() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/settings?key=videoSrc')
        if (!res.ok) throw new Error('Failed to fetch settings')
        const json = await res.json()
        const v = typeof json.value === 'string' && json.value.trim() !== ''
          ? json.value
          : 'https://www.youtube.com/watch?v=V1RPi2MYptM'
        if (!cancelled) setVideoSrc(v)
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load settings'
        if (!cancelled) setError(errorMessage)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchSetting()
    return () => {
      cancelled = true
    }
  }, [])

  const updateVideoSrc = async (value: string) => {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'videoSrc', value }),
    })
    if (!res.ok) throw new Error('Failed to update settings')
    const json = await res.json()
    setVideoSrc(json.value)
  }

  return { videoSrc, loading, error, updateVideoSrc }
}
