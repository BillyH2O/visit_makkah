"use client"

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type ProductAvailabilityAdminProps = {
  productId: string
  productName: string
}

export default function ProductAvailabilityAdmin({ productId, productName }: ProductAvailabilityAdminProps) {
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/availability`)
      if (!res.ok) throw new Error('Failed to fetch availability')
      const data = await res.json()
      // Ne récupérer que les dates indisponibles (isAvailable = false)
      setUnavailableDates(
        data.availability
          .filter((item: { date: string; isAvailable: boolean; id: string }) => !item.isAvailable)
          .map((item: { date: string; id: string }) => new Date(item.date))
          .sort((a: Date, b: Date) => a.getTime() - b.getTime())
      )
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  async function saveAvailability() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Ne stocker que les dates indisponibles
          availability: unavailableDates.map((date) => ({
            date: date.toISOString().split('T')[0],
            isAvailable: false,
          })),
        }),
      })
      
      if (!res.ok) {
        let errorMessage = `Erreur ${res.status}: Échec de la sauvegarde`
        try {
          const errorData = await res.json()
          errorMessage = errorData.details || errorData.error || errorMessage
          console.error('API error:', res.status, errorData)
        } catch {
          const errorText = await res.text()
          console.error('API error (text):', res.status, errorText)
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }
      
      await fetchAvailability()
      alert('Dates indisponibles sauvegardées avec succès')
    } catch (error) {
      console.error('Error saving availability:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      alert(`Erreur: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  function addUnavailableDate() {
    if (!selectedDate) return
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const exists = unavailableDates.some((date) => format(date, 'yyyy-MM-dd') === dateStr)
    if (exists) {
      alert('Cette date est déjà marquée comme indisponible')
      return
    }
    setUnavailableDates([...unavailableDates, selectedDate].sort((a, b) => a.getTime() - b.getTime()))
    setSelectedDate(undefined)
  }

  function removeUnavailableDate(date: Date) {
    setUnavailableDates(unavailableDates.filter((item) => format(item, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')))
  }

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
      <div>
        <h3 className="text-lg font-semibold">Dates indisponibles - {productName}</h3>
        <p className="text-sm text-gray-500 mt-1">
          Par défaut, toutes les dates sont disponibles. Ajoutez ici uniquement les dates à marquer comme indisponibles.
        </p>
      </div>
      
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <label className="block text-sm font-medium mb-2">Sélectionner une date à marquer comme indisponible</label>
          <DatePicker
            date={selectedDate}
            onSelect={setSelectedDate}
            placeholder="Choisir une date"
          />
        </div>
        
        <div className="flex-1 min-w-[200px] flex items-end">
          <Button 
            type="button" 
            onClick={addUnavailableDate} 
            disabled={!selectedDate} 
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Marquer comme indisponible
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Dates marquées comme indisponibles</h4>
        {unavailableDates.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune date indisponible. Toutes les dates sont disponibles par défaut.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {unavailableDates.map((date) => (
              <div
                key={format(date, 'yyyy-MM-dd')}
                className="flex items-center justify-between p-2 border border-red-200 dark:border-red-800 rounded bg-red-50 dark:bg-red-900/20"
              >
                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                  {format(date, 'PPP', { locale: fr })}
                </span>
                <button
                  type="button"
                  onClick={() => removeUnavailableDate(date)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
                  title="Rendre cette date disponible"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={saveAvailability} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white">
        {saving ? 'Sauvegarde...' : 'Sauvegarder les dates indisponibles'}
      </Button>
    </div>
  )
}

