"use client"
import { useState } from 'react'
import type { GalleryItem } from '@/hooks/useAdminGallery'
import SaveButton from '@/components/admin/common/SaveButton'

type Props = {
  item?: GalleryItem
  onSave: (data: Partial<GalleryItem>) => Promise<void>
  onCancel: () => void
}

export default function GalleryForm({ item, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState({
    type: item?.type || 'image',
    title: item?.title || '',
    desc: item?.desc || '',
    url: item?.url || '',
    span: item?.span || '',
    isActive: item?.isActive !== false,
    sortOrder: typeof item?.sortOrder === 'number' ? item!.sortOrder : 0,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...formData,
        sortOrder: Number.isFinite(Number(formData.sortOrder)) ? Number(formData.sortOrder) : 0,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">URL</label>
        <input
          type="text"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          placeholder="/photos/1.png"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Titre</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.desc}
          onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Span (classes CSS)</label>
        <input
          type="text"
          value={formData.span}
          onChange={(e) => setFormData({ ...formData, span: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          placeholder="md:col-span-2 md:row-span-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <span className="text-sm">Actif</span>
        </label>
        <div>
          <label className="block text-sm font-medium mb-1">Ordre d&apos;affichage</label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            placeholder="0, 1, 2 ..."
          />
        </div>
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

