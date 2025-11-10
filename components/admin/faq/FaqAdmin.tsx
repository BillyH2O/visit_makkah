"use client"
import { useState } from 'react'
import { useAdminFaq } from '@/hooks/useAdminFaq'
import FaqForm from './FaqForm'

export default function FaqAdmin() {
  const { data, loading, create, update, remove } = useAdminFaq()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <button
          onClick={() => setShowNewForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          + Ajouter
        </button>
      </div>

      {showNewForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <FaqForm
            onSave={async (question, answer) => {
              await create(question, answer)
              setShowNewForm(false)
            }}
            onCancel={() => setShowNewForm(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {data?.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
          >
            {editingId === item.id ? (
              <FaqForm
                question={item.question}
                answer={item.answer}
                onSave={async (question, answer) => {
                  await update(item.id, { question, answer })
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.question}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.answer}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

