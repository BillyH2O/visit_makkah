"use client"
import { useState } from 'react'
import SaveButton from '@/components/admin/common/SaveButton'

type Props = {
  question?: string
  answer?: string
  onSave: (question: string, answer: string) => Promise<void>
  onCancel: () => void
}

export default function FaqForm({ question = '', answer = '', onSave, onCancel }: Props) {
  const [formData, setFormData] = useState({ question, answer })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(formData.question, formData.answer)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Question</label>
        <input
          type="text"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Réponse</label>
        <textarea
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          rows={4}
          required
        />
      </div>
      <div className="flex gap-2">
        <SaveButton saving={saving} expand />
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}

