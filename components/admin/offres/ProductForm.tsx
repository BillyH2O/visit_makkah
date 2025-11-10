"use client"
import { useState } from 'react'
import type { AdminProduct } from '@/hooks/useAdminProducts'
import SaveButton from '@/components/admin/common/SaveButton'
import Image from 'next/image'

type Props = {
  product: AdminProduct
  onSave: (data: Partial<AdminProduct>) => Promise<void>
  onCancel: () => void
}

export default function ProductForm({ product, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    landingTitle: product.landingTitle || '',
    landingBio: product.landingBio || '',
    landingGradientClassName: product.landingGradientClassName || '',
    landingImageUrl: product.landingImageUrl || '',
    detailTitle: product.detailTitle || '',
    longDescriptionHtml: product.longDescriptionHtml || '',
    detailColorHex: product.detailColorHex || '',
    imageUrl: product.imageUrl || '',
    price: product.price?.toString() || '',
    firstPrice: product.firstPrice?.toString() || '',
    isPremium: product.isPremium || false,
    active: product.active !== false,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...formData,
        price: formData.price ? Number.parseFloat(formData.price) : undefined,
        firstPrice: formData.firstPrice ? Number.parseFloat(formData.firstPrice) : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nom</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image (URL)</label>
        <input
          type="text"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          placeholder="/images/makkah_illustration.png"
        />
        {formData.imageUrl && (
          <Image width={500} height={500} src={formData.imageUrl} alt="Preview" className="mt-2 h-24 w-32 object-cover rounded border" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Titre landing</label>
        <input
          type="text"
          value={formData.landingTitle}
          onChange={(e) => setFormData({ ...formData, landingTitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio landing</label>
        <textarea
          value={formData.landingBio}
          onChange={(e) => setFormData({ ...formData, landingBio: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Gradient landing</label>
        <input
          type="text"
          value={formData.landingGradientClassName}
          onChange={(e) => setFormData({ ...formData, landingGradientClassName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          placeholder="rounded-4xl bg-[linear-gradient(...)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image landing (URL)</label>
        <input
          type="text"
          value={formData.landingImageUrl}
          onChange={(e) => setFormData({ ...formData, landingImageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          placeholder="/images/landing_premium.png"
        />
        {formData.landingImageUrl && (
          <Image width={500} height={500} src={formData.landingImageUrl} alt="Preview landing" className="mt-2 h-24 w-32 object-cover rounded border" />
        )}
        <p className="text-xs text-gray-500 mt-1">Image pour la page d&apos;accueil (si différente de l&apos;image détail)</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Titre détail</label>
        <input
          type="text"
          value={formData.detailTitle}
          onChange={(e) => setFormData({ ...formData, detailTitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description HTML détail</label>
        <textarea
          value={formData.longDescriptionHtml}
          onChange={(e) => setFormData({ ...formData, longDescriptionHtml: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Couleur hex</label>
        <input
          type="text"
          value={formData.detailColorHex}
          onChange={(e) => setFormData({ ...formData, detailColorHex: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          placeholder="#FDF6E2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Prix (€)</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Prix avant promo (€)</label>
        <input
          type="number"
          step="0.01"
          value={formData.firstPrice}
          onChange={(e) => setFormData({ ...formData, firstPrice: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Laissez vide si pas de promo"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPremium}
            onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
          />
          <span className="text-sm">Premium</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          />
          <span className="text-sm">Actif</span>
        </label>
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

