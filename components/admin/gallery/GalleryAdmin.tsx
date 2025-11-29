"use client"
import { useState } from 'react'
import { useAdminGallery } from '@/hooks/useAdminGallery'
import GalleryForm from './GalleryForm'
import Image from 'next/image'

// Helper function to check if URL is a video/external link
const isImageUrl = (url: string): boolean => {
  if (!url) return false
  
  // Clean URL (remove leading slash if present, especially for malformed URLs like "/https://...")
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url
  
  // Check if it's a YouTube URL (including shorts)
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    return false
  }
  
  // Check if it's a valid image extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  const hasImageExtension = imageExtensions.some(ext => cleanUrl.toLowerCase().includes(ext))
  
  // If it starts with http/https and has no image extension, it's likely not an image
  if (cleanUrl.startsWith('http') && !hasImageExtension) {
    return false
  }
  
  // If it starts with / and doesn't start with /http, it's a local image
  if (url.startsWith('/') && !url.startsWith('/http')) {
    return true
  }
  
  // If it's a relative path without http, assume it's an image
  if (!cleanUrl.startsWith('http')) {
    return true
  }
  
  return true
}

// Helper function to clean and normalize URLs
const normalizeUrl = (url: string): string => {
  if (!url) return ''
  // Remove leading slash if URL starts with /https:// or /http://
  if (url.startsWith('/https://') || url.startsWith('/http://')) {
    return url.slice(1)
  }
  return url
}

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
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {item.url && (
                    isImageUrl(item.url) ? (
                      (() => {
                        const normalizedUrl = normalizeUrl(item.url)
                        const isExternalUrl = normalizedUrl.startsWith('http')
                        const imageSrc = item.url.startsWith('/') ? item.url : (isExternalUrl ? normalizedUrl : `/${item.url}`)
                        
                        // Use regular img tag for external URLs not in next.config
                        if (isExternalUrl) {
                          return (
                            <Image
                              src={imageSrc}
                              alt={item.title || 'Gallery item'}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          )
                        }
                        
                        // Use Next.js Image for local images
                        return (
                          <Image
                            src={imageSrc}
                            alt={item.title || 'Gallery item'}
                            fill
                            className="object-cover"
                          />
                        )
                      })()
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4">
                        <a
                          href={normalizeUrl(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm text-center break-all"
                        >
                          {item.url.includes('youtube') ? '🎥 Vidéo YouTube' : '🔗 Lien externe'}
                          <br />
                          <span className="text-xs opacity-70">Cliquer pour ouvrir</span>
                        </a>
                      </div>
                    )
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

