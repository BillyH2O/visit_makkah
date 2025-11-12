"use client"

import { useEffect, useState } from 'react'

export function useAdminSettings() {
  const [videoSrc, setVideoSrc] = useState<string>('https://www.youtube.com/watch?v=V1RPi2MYptM')
  const [depositEnabled, setDepositEnabled] = useState<boolean>(true)
  const [depositPercent, setDepositPercent] = useState<number>(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchSettings() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/settings')
        if (!res.ok) throw new Error('Failed to fetch settings')
        const json = await res.json() as { settings: Array<{ key: string; value: string }> }
        const map = new Map(json.settings.map(s => [s.key, s.value]))
        const v = map.get('videoSrc') && map.get('videoSrc')!.trim() !== '' ? map.get('videoSrc')! : 'https://www.youtube.com/watch?v=V1RPi2MYptM'
        const de = map.get('depositEnabled')
        const dp = map.get('depositPercent')
        if (!cancelled) {
          setVideoSrc(v)
          setDepositEnabled(de ? de === 'true' : true)
          const percentParsed = dp ? Number.parseFloat(dp) : 20
          setDepositPercent(Number.isFinite(percentParsed) ? Math.min(100, Math.max(1, percentParsed)) : 20)
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load settings'
        if (!cancelled) setError(errorMessage)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchSettings()
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

  const updateDepositEnabled = async (value: boolean) => {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'depositEnabled', value: String(value) }),
    })
    if (!res.ok) throw new Error('Failed to update settings')
    const json = await res.json()
    setDepositEnabled(json.value === 'true')
  }

  const updateDepositPercent = async (value: number) => {
    const clamped = Math.min(100, Math.max(1, Math.round(value)))
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'depositPercent', value: String(clamped) }),
    })
    if (!res.ok) throw new Error('Failed to update settings')
    const json = await res.json()
    const parsed = Number.parseFloat(json.value)
    setDepositPercent(Number.isFinite(parsed) ? parsed : clamped)
  }

  return {
    videoSrc,
    depositEnabled,
    depositPercent,
    loading,
    error,
    updateVideoSrc,
    updateDepositEnabled,
    updateDepositPercent,
  }
}
