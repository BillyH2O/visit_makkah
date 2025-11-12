"use client"

import { useState } from 'react'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import SaveButton from '@/components/admin/common/SaveButton'

export default function SettingsAdmin() {
  const { videoSrc, depositEnabled, depositPercent, loading, error, updateVideoSrc, updateDepositEnabled, updateDepositPercent } = useAdminSettings()
  const [value, setValue] = useState<string>('')
  const [localDepositEnabled, setLocalDepositEnabled] = useState<boolean>(true)
  const [localDepositPercent, setLocalDepositPercent] = useState<number>(20)
  const [saving, setSaving] = useState(false)

  // sync input when loaded
  if (!loading && value === '' && videoSrc) {
    setTimeout(() => setValue(videoSrc), 0)
  }
  if (!loading && depositEnabled !== undefined && localDepositEnabled !== depositEnabled) {
    setTimeout(() => setLocalDepositEnabled(depositEnabled), 0)
  }
  if (!loading && Number.isFinite(depositPercent) && localDepositPercent !== depositPercent) {
    setTimeout(() => setLocalDepositPercent(depositPercent), 0)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateVideoSrc(value)
      await updateDepositEnabled(localDepositEnabled)
      await updateDepositPercent(localDepositPercent)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Paramètres du site</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">URL de la vidéo (landing)</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=V1RPi2MYptM"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          />
          <p className="text-xs text-gray-500 mt-1">URL Youtube ou autre source vidéo.</p>
        </div>

        <div className="border-t border-black/10 dark:border-white/10 pt-4">
          <h3 className="text-lg font-semibold mb-2">Paiement — Acompte</h3>
          <div className="flex items-center gap-3 mb-3">
            <input
              id="depositEnabled"
              type="checkbox"
              checked={localDepositEnabled}
              onChange={(e) => setLocalDepositEnabled(e.target.checked)}
            />
            <label htmlFor="depositEnabled" className="text-sm">Activer l&apos;acompte (hors VISA)</label>
          </div>
          <div className="max-w-xs">
            <label className="block text-sm font-medium mb-1">Pourcentage d&apos;acompte</label>
            <input
              type="number"
              min={1}
              max={100}
              value={localDepositPercent}
              onChange={(e) => setLocalDepositPercent(Math.min(100, Math.max(1, Number(e.target.value) || 20)))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            />
            <p className="text-xs text-gray-500 mt-1">Par défaut: 20%. S&apos;applique à toutes les catégories sauf VISA (paiement total).</p>
          </div>
        </div>

        <SaveButton saving={saving} />
      </form>

      {error ? <p className="text-sm text-red-500 mt-2">{error}</p> : null}
    </div>
  )
}
