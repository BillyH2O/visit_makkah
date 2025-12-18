import CheckoutButton from '@/components/checkout/CheckoutButton'
import { useProductsByCategory } from '@/hooks/useProducts'
import Loader from '@/components/ui/Loader'
import Counter from '@/components/ui/Counter'
import { DatePicker } from '@/components/ui/DatePicker'
import { useProductAvailability } from '@/hooks/useProductAvailability'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import type { ProductDTO } from '@/types/product'
import { cn } from '@/lib/utils'
import { calculatePrice } from '@/lib/pricing'
import { useDepositSettings } from '@/hooks/useDepositSettings'

function PremiumRow({ p, imageClassName }: { p: ProductDTO; imageClassName?: string }) {
  const [peopleCount, setPeopleCount] = useState<number>(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { data: availability } = useProductAvailability(p.id)
  const { depositEnabled, depositPercent } = useDepositSettings()
  const basePriceEuro = p.unitAmount != null ? p.unitAmount / 100 : null
  
  // Extract metadata for pricing calculation
  const metadata = p.metadata as { includedPeople?: number; extraPerPersonCents?: number } | null
  const includedPeople = metadata?.includedPeople ?? 0
  const extraPerPersonCents = metadata?.extraPerPersonCents ?? 0
  
  // Vérifier si l'acompte s'applique (OFFRE et SERVICE, pas VISA et SADAQA)
  const showDepositInfo = depositEnabled && (p.categoryCode === 'OFFRE' || p.categoryCode === 'SERVICE')

  // Convert string dates to Date objects
  const availableDates = useMemo(() => {
    return availability?.availableDates.map(d => new Date(d)) || []
  }, [availability?.availableDates])

  const unavailableDates = useMemo(() => {
    return availability?.unavailableDates.map(d => new Date(d)) || []
  }, [availability?.unavailableDates])

  // Calcul du prix promotionnel dynamique selon le nombre de personnes
  const baseFirstPriceEuro = p.firstUnitAmount != null ? p.firstUnitAmount / 100 : null
  const calculatedFirstPrice = useMemo(() => {
    return calculatePrice(baseFirstPriceEuro, peopleCount, includedPeople, extraPerPersonCents)
  }, [baseFirstPriceEuro, peopleCount, includedPeople, extraPerPersonCents])

  // Calcul du prix dynamique selon le nombre de personnes
  const calculatedPrice = useMemo(() => {
    return calculatePrice(basePriceEuro, peopleCount, includedPeople, extraPerPersonCents)
  }, [basePriceEuro, peopleCount, includedPeople, extraPerPersonCents])

  const displayPriceEuro = calculatedPrice != null ? Math.round(calculatedPrice) : undefined
  const displayFirstPriceEuro = calculatedFirstPrice != null ? Math.round(calculatedFirstPrice) : undefined

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
              {displayFirstPriceEuro != null && displayPriceEuro != null && (
                <h3 className="text-5xl text-red-400 font-semibold line-through whitespace-nowrap">
                  {displayFirstPriceEuro}€
                </h3>
              )}
              <h3 className="text-5xl text-primary font-semibold whitespace-nowrap">
              {displayPriceEuro != null ? `${displayPriceEuro}€` : 'Sur devis'}
            </h3>
            </div>
            {p.infoLabel ? (
              <p className="text-base text-primary wrap-break-word">{p.infoLabel}</p>
            ) : null}
            {showDepositInfo && (
              <p className="text-sm text-primary/80 wrap-break-word">
                * Paiement de {depositPercent}% d&apos;acompte. Le reste sera à payer sur place.
              </p>
            )}
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

          {/* Compteur et bouton Réserver sur la même ligne */}
          <div className="flex items-center justify-between gap-2 w-full">
            <Counter 
              value={peopleCount}
              onValueChange={setPeopleCount}
            />
            <CheckoutButton 
              productId={p.id} 
              label="Réserver" 
              peopleCount={peopleCount} 
              className="shrink-0" 
              reservationDate={selectedDate}
              disabled={!selectedDate}
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