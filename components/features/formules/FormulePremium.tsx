import CheckoutButton from '@/components/checkout/CheckoutButton'
import { useProductsByCategory } from '@/hooks/useProducts'
import Loader from '@/components/ui/Loader'
import PeopleCountSelect from '@/components/ui/PeopleCountSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { useProductAvailability } from '@/hooks/useProductAvailability'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import type { ProductDTO } from '@/types/product'
import { cn } from '@/lib/utils'

function PremiumRow({ p, imageClassName }: { p: ProductDTO; imageClassName?: string }) {
  const [peopleCount, setPeopleCount] = useState<number | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { data: availability } = useProductAvailability(p.id)
  const basePriceEuro = p.unitAmount != null ? p.unitAmount / 100 : null
  
  // Extract metadata for pricing calculation
  const metadata = p.metadata as { includedPeople?: number; extraPerPersonCents?: number } | null
  const includedPeople = metadata?.includedPeople ?? 0
  const extraPerPersonCents = metadata?.extraPerPersonCents ?? 0

  // Convert string dates to Date objects
  const availableDates = useMemo(() => {
    return availability?.availableDates.map(d => new Date(d)) || []
  }, [availability?.availableDates])

  const unavailableDates = useMemo(() => {
    return availability?.unavailableDates.map(d => new Date(d)) || []
  }, [availability?.unavailableDates])

  // Calcul du prix dynamique selon le nombre de personnes
  const calculatedPrice = useMemo(() => {
    if (basePriceEuro == null) return null
    if (!peopleCount || peopleCount < 1) return basePriceEuro
    
    const basePriceCents = Math.round(basePriceEuro * 100)
    
    if (includedPeople > 0 && peopleCount > includedPeople) {
      // Logique : personnes incluses paient le prix de base, les supplémentaires paient seulement le supplément
      // Exemple : 100€ avec supplément 10€ à partir de 3 personnes
      // - 3 personnes : 3 × 100€ = 300€
      // - 4 personnes : 3 × 100€ + 1 × 10€ = 310€
      const baseUnits = includedPeople
      const extraUnits = peopleCount - includedPeople
      const totalCents = (basePriceCents * baseUnits) + (extraPerPersonCents * extraUnits)
      return totalCents / 100
    } else {
      // Si pas de logique de personnes incluses ou nombre <= personnes incluses : tout le monde paie le prix de base
      return (basePriceCents * peopleCount) / 100
    }
  }, [basePriceEuro, peopleCount, includedPeople, extraPerPersonCents])

  const displayPriceEuro = calculatedPrice != null ? Math.round(calculatedPrice) : undefined

  return (
    <div className="w-full flex flex-col-reverse lg:flex-row gap-16 items-center justify-center">
      <div className="w-full flex flex-col gap-12 items-center justify-center lg:items-start">
        <h3 className="w-[85%] sm:w-[600px] lg:w-full text-3xl sm:text-5xl text-center lg:text-left">
          {p.detailTitle || p.name}
        </h3>
        <div className="text-base w-full max-w-[700px]">
          <div
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-2 [&_li]:ml-4"
            dangerouslySetInnerHTML={{ __html: p.longDescriptionHtml || '' }}
          />
        </div>
        <div className="w-full max-w-[75%] flex flex-col gap-6">
          {/* Prix promo, prix réel et label metadata */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-end flex-wrap">
              {p.firstUnitAmount && p.firstUnitAmount > 0 && displayPriceEuro != null && (
                <h3 className="text-5xl text-red-400 font-semibold line-through whitespace-nowrap">
                  {Math.round(p.firstUnitAmount / 100)}€
                </h3>
              )}
              <h3 className="text-5xl text-primary font-semibold whitespace-nowrap">
              {displayPriceEuro != null ? `${displayPriceEuro}€` : 'Sur devis'}
            </h3>
            </div>
            {p.infoLabel ? (
              <p className="text-base text-primary wrap-break-word">{p.infoLabel}</p>
            ) : null}
          </div>
          
          {/* Calendrier */}
          <div className="w-full">
            <DatePicker
              date={selectedDate}
              onSelect={setSelectedDate}
              availableDates={availableDates}
              unavailableDates={unavailableDates}
              placeholder="Sélectionner une date"
            />
          </div>

          {/* Sélecteur et bouton Réserver sur la même ligne */}
          <div className="flex items-center justify-between gap-2 w-full">
            <PeopleCountSelect 
              value={peopleCount}
              onValueChange={setPeopleCount}
            />
            <CheckoutButton 
              productId={p.id} 
              label="Réserver" 
              peopleCount={peopleCount} 
              className="shrink-0" 
              reservationDate={selectedDate}
              disabled={!selectedDate || !peopleCount || peopleCount < 1}
            />
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center">
        <Image src={p.imageUrl || '/images/placeholder.png'} alt={p.detailTitle || p.name} width={480} height={580} className={cn("lg:w-[780px] w-[380px] h-auto rounded-3xl object-cover", imageClassName)} />
      </div>
    </div>
  )
}

export default function Premium() {
  const { data: products, loading } = useProductsByCategory('OFFRE', { isPremium: true })

  if (loading) {
    return <Loader label="Chargement de la formule premium..." />
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="w-full flex flex-col gap-16 items-center justify-center">
      {products.map((p) => {
        const imageClassName = (p.metadata as { imageClassName?: string } | null)?.imageClassName
        return <PremiumRow key={p.id} p={p} imageClassName={imageClassName} />
      })}
    </div>
  )
}