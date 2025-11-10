"use client"
import { useState } from 'react'
import { useAdminGallery } from '@/hooks/useAdminGallery'
import GalleryForm from './GalleryForm'
import Image from 'next/image'

export default function GalleryAdmin() {
  const { data, loading, create, update, remove } = useAdminGallery()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Galerie</h2>
        <button
          onClick={() => setShowNewForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          + Ajouter
        </button>
      </div>

      {showNewForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <GalleryForm
            onSave={async (data) => {
              await create(data)
              setShowNewForm(false)
            }}
            onCancel={() => setShowNewForm(false)}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
          >
            {editingId === item.id ? (
              <div className="p-4">
                <GalleryForm
                  item={item}
                  onSave={async (data) => {
                    await update(item.id, data)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <>
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800">
                  {item.url && (
                    <Image
                      src={item.url.startsWith('/') ? item.url : `/${item.url}`}
                      alt={item.title || 'Gallery item'}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold">{item.title || 'Sans titre'}</h3>
                  {item.desc && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  )}
                  <p className="text-xs text-gray-500">{item.url}</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

