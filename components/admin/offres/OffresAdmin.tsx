"use client"
import { useState } from 'react'
import { useAdminProducts } from '@/hooks/useAdminProducts'
import ProductForm from './ProductForm'
import type { CategoryCode } from '@/types/product'

const categories: { id: CategoryCode; label: string }[] = [
  { id: 'OFFRE', label: 'Formules' },
  { id: 'SERVICE', label: 'Services' },
  { id: 'SADAQA', label: 'Sadaqa' },
  { id: 'VISA', label: 'Visa' },
]

export default function OffresAdmin() {
  const [activeCategory, setActiveCategory] = useState<CategoryCode>('OFFRE')
  const { data, loading, updateProduct } = useAdminProducts(activeCategory)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
          >
            {editingId === product.id ? (
              <ProductForm
                product={product}
                onSave={async (data) => {
                  await updateProduct(product.id, data)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="space-y-2">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {product.detailTitle || product.landingTitle || 'Sans titre'}
                </p>
                {product.price && (
                  <p className="text-lg font-bold text-primary">{product.price}€</p>
                )}
                <button
                  onClick={() => setEditingId(product.id)}
                  className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

