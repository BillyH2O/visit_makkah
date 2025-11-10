"use client"

import { useState } from 'react'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import SaveButton from '@/components/admin/common/SaveButton'

export default function SettingsAdmin() {
  const { videoSrc, loading, error, updateVideoSrc } = useAdminSettings()
  const [value, setValue] = useState<string>('')
  const [saving, setSaving] = useState(false)

  // sync input when loaded
  if (!loading && value === '' && videoSrc) {
    setTimeout(() => setValue(videoSrc), 0)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateVideoSrc(value)
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

        <SaveButton saving={saving} />
      </form>

      {error ? <p className="text-sm text-red-500 mt-2">{error}</p> : null}
    </div>
  )
}
