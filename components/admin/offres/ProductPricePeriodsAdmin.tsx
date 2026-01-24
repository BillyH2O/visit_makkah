"use client"

import { useState, useEffect, useCallback } from 'react'
import { format, eachDayOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/button'
import { X, Plus, Calendar, Euro } from 'lucide-react'

type PricePeriod = {
  id?: string
  name: string
  startDate: Date
  endDate: Date
  unitAmount: number
  compareAtAmount: number | null
  extraPerPersonCents: number | null
  isActive: boolean
}

type ProductPricePeriodsAdminProps = {
  productId: string
  productName: string
  basePrice: number | null // Prix de base en centimes
}

export default function ProductPricePeriodsAdmin({ productId, productName, basePrice }: ProductPricePeriodsAdminProps) {
  const [pricePeriods, setPricePeriods] = useState<PricePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Formulaire pour nouvelle période
  const [showForm, setShowForm] = useState(false)
  const [newPeriod, setNewPeriod] = useState<{
    name: string
    startDate: Date | undefined
    endDate: Date | undefined
    unitAmount: string
    compareAtAmount: string
    extraPerPersonCents: string
  }>({
    name: '',
    startDate: undefined,
    endDate: undefined,
    unitAmount: '',
    compareAtAmount: '',
    extraPerPersonCents: '',
  })

  const fetchPricePeriods = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/price-periods`)
      if (!res.ok) throw new Error('Failed to fetch price periods')
      const data = await res.json()
      setPricePeriods(
        data.pricePeriods.map((p: {
          id: string
          name: string
          startDate: string
          endDate: string
          unitAmount: number
          compareAtAmount: number | null
          extraPerPersonCents: number | null
          isActive: boolean
        }) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate),
        }))
      )
    } catch (error) {
      console.error('Error fetching price periods:', error)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchPricePeriods()
  }, [fetchPricePeriods])

  async function savePricePeriods() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/price-periods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricePeriods: pricePeriods.map((p) => ({
            name: p.name,
            startDate: p.startDate.toISOString().split('T')[0],
            endDate: p.endDate.toISOString().split('T')[0],
            unitAmount: p.unitAmount,
            compareAtAmount: p.compareAtAmount,
            extraPerPersonCents: p.extraPerPersonCents,
            isActive: p.isActive,
          })),
        }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.details || errorData.error || 'Erreur lors de la sauvegarde')
      }
      
      await fetchPricePeriods()
      alert('Périodes de prix sauvegardées avec succès')
    } catch (error) {
      console.error('Error saving price periods:', error)
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setSaving(false)
    }
  }

  function addPricePeriod() {
    if (!newPeriod.name || !newPeriod.startDate || !newPeriod.endDate || !newPeriod.unitAmount) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (newPeriod.startDate > newPeriod.endDate) {
      alert('La date de début doit être antérieure à la date de fin')
      return
    }

    const unitAmount = Math.round(parseFloat(newPeriod.unitAmount) * 100)
    const compareAtAmount = newPeriod.compareAtAmount 
      ? Math.round(parseFloat(newPeriod.compareAtAmount) * 100) 
      : null
    const extraPerPersonCents = newPeriod.extraPerPersonCents 
      ? Math.round(parseFloat(newPeriod.extraPerPersonCents) * 100) 
      : null

    setPricePeriods([
      ...pricePeriods,
      {
        name: newPeriod.name,
        startDate: newPeriod.startDate,
        endDate: newPeriod.endDate,
        unitAmount,
        compareAtAmount,
        extraPerPersonCents,
        isActive: true,
      },
    ].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()))

    setNewPeriod({
      name: '',
      startDate: undefined,
      endDate: undefined,
      unitAmount: '',
      compareAtAmount: '',
      extraPerPersonCents: '',
    })
    setShowForm(false)
  }

  function removePricePeriod(index: number) {
    setPricePeriods(pricePeriods.filter((_, i) => i !== index))
  }

  function togglePeriodActive(index: number) {
    setPricePeriods(pricePeriods.map((p, i) => 
      i === index ? { ...p, isActive: !p.isActive } : p
    ))
  }

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Périodes de prix - {productName}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Définissez des prix différents pour des périodes spécifiques (ex: Hajj, Ramadan, haute saison).
          {basePrice && (
            <span className="block mt-1">
              Prix de base actuel : <strong>{(basePrice / 100).toFixed(2)}€</strong>
            </span>
          )}
        </p>
      </div>

      {/* Liste des périodes existantes */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Périodes configurées</h4>
        {pricePeriods.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Aucune période de prix configurée. Le prix de base s&apos;applique à toutes les dates.
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {pricePeriods.map((period, index) => (
              <div
                key={period.id || index}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  period.isActive 
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{period.name}</span>
                    {!period.isActive && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                        Désactivée
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {format(period.startDate, 'dd MMM yyyy', { locale: fr })} → {format(period.endDate, 'dd MMM yyyy', { locale: fr })}
                    <span className="ml-2">
                      ({eachDayOfInterval({ start: period.startDate, end: period.endDate }).length} jours)
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    {period.compareAtAmount && (
                      <span className="text-red-400 line-through mr-2">
                        {(period.compareAtAmount / 100).toFixed(2)}€
                      </span>
                    )}
                    <span className="font-semibold text-primary">
                      {(period.unitAmount / 100).toFixed(2)}€
                    </span>
                    {basePrice && (
                      <span className={`ml-2 text-xs ${
                        period.unitAmount > basePrice 
                          ? 'text-red-500' 
                          : period.unitAmount < basePrice 
                          ? 'text-green-500' 
                          : 'text-gray-500'
                      }`}>
                        ({period.unitAmount > basePrice ? '+' : ''}{(((period.unitAmount - basePrice) / basePrice) * 100).toFixed(0)}% vs base)
                      </span>
                    )}
                    {period.extraPerPersonCents != null && period.extraPerPersonCents > 0 && (
                      <span className="ml-2 text-xs text-orange-500">
                        (+{(period.extraPerPersonCents / 100).toFixed(0)}€/pers. supp.)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePeriodActive(index)}
                    className={`px-2 py-1 text-xs rounded ${
                      period.isActive 
                        ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {period.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removePricePeriod(index)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
                    title="Supprimer cette période"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bouton pour ajouter une période */}
      {!showForm && (
        <Button
          type="button"
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une période de prix
        </Button>
      )}

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <h4 className="font-medium">Nouvelle période de prix</h4>
          
          <div>
            <label className="block text-sm font-medium mb-1">Nom de la période *</label>
            <input
              type="text"
              value={newPeriod.name}
              onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
              placeholder="Ex: Période Hajj, Ramadan, Haute saison..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date de début *</label>
              <DatePicker
                date={newPeriod.startDate}
                onSelect={(date) => setNewPeriod({ ...newPeriod, startDate: date })}
                placeholder="Date de début"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de fin *</label>
              <DatePicker
                date={newPeriod.endDate}
                onSelect={(date) => setNewPeriod({ ...newPeriod, endDate: date })}
                placeholder="Date de fin"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prix pour cette période (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPeriod.unitAmount}
                onChange={(e) => setNewPeriod({ ...newPeriod, unitAmount: e.target.value })}
                placeholder="Ex: 1500.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prix barré (€) - optionnel</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPeriod.compareAtAmount}
                onChange={(e) => setNewPeriod({ ...newPeriod, compareAtAmount: e.target.value })}
                placeholder="Ex: 1800.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pers. supp. (€) - optionnel</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPeriod.extraPerPersonCents}
                onChange={(e) => setNewPeriod({ ...newPeriod, extraPerPersonCents: e.target.value })}
                placeholder="Ex: 150.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">Prix par personne au-delà du seuil inclus</p>
            </div>
          </div>

          {newPeriod.startDate && newPeriod.endDate && newPeriod.startDate <= newPeriod.endDate && (
            <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              📅 Cette période couvre {eachDayOfInterval({ start: newPeriod.startDate, end: newPeriod.endDate }).length} jour(s)
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={addPricePeriod}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Ajouter la période
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setNewPeriod({
                  name: '',
                  startDate: undefined,
                  endDate: undefined,
                  unitAmount: '',
                  compareAtAmount: '',
                  extraPerPersonCents: '',
                })
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Bouton de sauvegarde */}
      <Button 
        onClick={savePricePeriods} 
        disabled={saving} 
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder les périodes de prix'}
      </Button>
    </div>
  )
}

