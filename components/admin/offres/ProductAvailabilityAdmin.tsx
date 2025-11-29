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

type AvailabilityItem = {
  id?: string
  date: Date
  isAvailable: boolean
}

export default function ProductAvailabilityAdmin({ productId, productName }: ProductAvailabilityAdminProps) {
  const [availability, setAvailability] = useState<AvailabilityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isAvailable, setIsAvailable] = useState(true)

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/availability`)
      if (!res.ok) throw new Error('Failed to fetch availability')
      const data = await res.json()
      setAvailability(
        data.availability.map((item: { date: string; isAvailable: boolean; id: string }) => ({
          id: item.id,
          date: new Date(item.date),
          isAvailable: item.isAvailable,
        }))
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
          availability: availability.map((item) => ({
            date: item.date.toISOString().split('T')[0],
            isAvailable: item.isAvailable,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to save availability')
      await fetchAvailability()
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  function addDate() {
    if (!selectedDate) return
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const exists = availability.some((item) => format(item.date, 'yyyy-MM-dd') === dateStr)
    if (exists) {
      alert('Cette date existe déjà')
      return
    }
    setAvailability([...availability, { date: selectedDate, isAvailable }].sort((a, b) => a.date.getTime() - b.date.getTime()))
    setSelectedDate(undefined)
  }

  function removeDate(date: Date) {
    setAvailability(availability.filter((item) => format(item.date, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')))
  }

  function toggleAvailability(date: Date) {
    setAvailability(
      availability.map((item) =>
        format(item.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          ? { ...item, isAvailable: !item.isAvailable }
          : item
      )
    )
  }

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold">Disponibilités - {productName}</h3>
      
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <label className="block text-sm font-medium mb-2">Sélectionner une date</label>
          <DatePicker
            date={selectedDate}
            onSelect={setSelectedDate}
            placeholder="Choisir une date"
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2">Statut</label>
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={isAvailable ? 'default' : 'outline'}
              onClick={() => setIsAvailable(true)}
              className="flex-1"
            >
              Disponible
            </Button>
            <Button
              type="button"
              variant={!isAvailable ? 'default' : 'outline'}
              onClick={() => setIsAvailable(false)}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Indisponible
            </Button>
          </div>
          <Button type="button" onClick={addDate} disabled={!selectedDate} className="w-full">
            Ajouter la date
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Dates configurées</h4>
        {availability.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune date configurée</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availability.map((item) => (
              <div
                key={format(item.date, 'yyyy-MM-dd')}
                className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded"
              >
                <span className="text-sm">
                  {format(item.date, 'PPP', { locale: fr })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAvailability(item.date)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      item.isAvailable
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {item.isAvailable ? 'Disponible' : 'Indisponible'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDate(item.date)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={saveAvailability} disabled={saving} className="w-full">
        {saving ? 'Sauvegarde...' : 'Sauvegarder les disponibilités'}
      </Button>
    </div>
  )
}

