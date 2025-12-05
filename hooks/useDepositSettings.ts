"use client"

import { useEffect, useState } from 'react'

export function useDepositSettings() {
  const [depositEnabled, setDepositEnabled] = useState<boolean>(true)
  const [depositPercent, setDepositPercent] = useState<number>(20)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings/deposit')
        if (!cancelled && res.ok) {
          const json = await res.json() as { depositEnabled: boolean; depositPercent: number }
          setDepositEnabled(json.depositEnabled)
          setDepositPercent(json.depositPercent)
        }
      } catch {
        // En cas d'erreur, on garde les valeurs par défaut
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    fetchSettings()
    return () => {
      cancelled = true
    }
  }, [])

  return {
    depositEnabled,
    depositPercent,
    loading,
  }
}

