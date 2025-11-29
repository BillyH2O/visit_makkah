"use client"
import { useState } from 'react'
import { useAdminProducts } from '@/hooks/useAdminProducts'
import ProductForm from './ProductForm'
import ProductAvailabilityAdmin from './ProductAvailabilityAdmin'
import type { CategoryCode } from '@/types/product'

const categories: { id: CategoryCode; label: string }[] = [
  { id: 'OFFRE', label: 'Formules' },
  { id: 'SERVICE', label: 'Services' },
  { id: 'SADAQA', label: 'Sadaqa' },
  { id: 'VISA', label: 'Visa' },
]

export default function OffresAdmin() {
  const [activeCategory, setActiveCategory] = useState<CategoryCode>('OFFRE')
  const { data, loading, updateProduct, createProduct, deleteProduct, refetch } = useAdminProducts(activeCategory)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [managingAvailabilityId, setManagingAvailabilityId] = useState<string | null>(null)
  const [creatingNew, setCreatingNew] = useState(false)

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return
    }
    try {
      await deleteProduct(id)
      refetch()
    } catch (error) {
      alert('Erreur lors de la suppression')
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                setCreatingNew(false)
                setEditingId(null)
              }}
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
        {!managingAvailabilityId && !creatingNew && (
          <button
            onClick={() => {
              setCreatingNew(true)
              setEditingId(null)
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            + Ajouter une offre
          </button>
        )}
      </div>

      {managingAvailabilityId ? (
        <div>
          {data?.find((p) => p.id === managingAvailabilityId) && (
            <ProductAvailabilityAdmin
              productId={managingAvailabilityId}
              productName={data.find((p) => p.id === managingAvailabilityId)?.name || ''}
            />
          )}
          <button
            onClick={() => setManagingAvailabilityId(null)}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90"
          >
            Retour
          </button>
        </div>
      ) : creatingNew ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Nouvelle offre</h2>
          <ProductForm
            product={null}
            categoryCode={activeCategory}
            onSave={async (data) => {
              await createProduct(activeCategory, data)
              setCreatingNew(false)
              refetch()
            }}
            onCancel={() => setCreatingNew(false)}
          />
        </div>
      ) : (
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
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(product.id)}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setManagingAvailabilityId(product.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Dates
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

