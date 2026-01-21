
import { useState, useMemo } from 'react'
import Button from '@/components/ui/MainButton'
import CheckoutButton from '@/components/checkout/CheckoutButton'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import Selector from '@/components/ui/Selector'
import Counter from '@/components/ui/Counter'
import { DatePicker } from '@/components/ui/DatePicker'
import { useProductAvailability } from '@/hooks/useProductAvailability'
import { calculatePrice } from '@/lib/pricing'

type HighlightCardProps = {
  title: string
  descriptionHtml: string
  price?: string
  basePriceEuro?: number | null
  firstUnitAmount?: number | null
  infoLabel?: string
  buttonLabel?: string
  image: string
  imageLeft?: boolean
  color?: string
  descriptionTextColor?: 'light' | 'dark'
  productId?: string
  enableQuantity?: boolean
  enableCalendar?: boolean
  imageClassName?: string
  includedPeople?: number
  extraPerPersonCents?: number
  categoryCode?: 'OFFRE' | 'SADAQA' | 'VISA' | 'SERVICE'
}

const HighlightCard = ({
  title,
  descriptionHtml,
  price,
  basePriceEuro,
  firstUnitAmount,
  infoLabel,
  buttonLabel = 'Découvrir',
  image,
  imageLeft = false,
  color,
  descriptionTextColor = 'dark',
  productId,
  enableQuantity = false,
  enableCalendar = true,
  imageClassName,
  includedPeople = 0,
  extraPerPersonCents = 0,
  categoryCode,
}: HighlightCardProps) => {
  // Détecter si c'est un produit qui nécessite le Counter (Coran ou Sadaqa Jariya)
  const isCounterProduct = useMemo(() => {
    const titleLower = title.toLowerCase()
    // Normaliser les accents pour la détection
    const titleNormalized = titleLower
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    
    return (
      titleLower.includes('coran') ||
      titleNormalized.includes('sadaqa jariya') ||
      titleNormalized.includes('saddaqa jariya') ||
      titleNormalized.includes('jariya') ||
      titleLower.includes('chaise roulante') ||
      titleLower.includes('chaise')
    )
  }, [title])

  // Initialiser à 1 pour les produits Counter, undefined pour les autres
  const [peopleCount, setPeopleCount] = useState<number | undefined>(() => isCounterProduct ? 1 : undefined)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  
  // Calcul du prix dynamique si basePriceEuro est fourni, sinon utiliser price statique
  const calculatedPrice = useMemo(() => {
    if (basePriceEuro != null) {
      return calculatePrice(basePriceEuro, enableQuantity ? peopleCount : undefined, includedPeople, extraPerPersonCents)
    }
    return null
  }, [basePriceEuro, enableQuantity, peopleCount, includedPeople, extraPerPersonCents])
  
  const calculatedFirstPrice = useMemo(() => {
    if (firstUnitAmount != null) {
      const baseFirstPriceEuro = firstUnitAmount / 100
      return calculatePrice(baseFirstPriceEuro, enableQuantity ? peopleCount : undefined, includedPeople, extraPerPersonCents)
    }
    return null
  }, [firstUnitAmount, enableQuantity, peopleCount, includedPeople, extraPerPersonCents])
  
  const hasPrice = (calculatedPrice != null || (price && price.trim() !== ''))
  const displayPrice = calculatedPrice != null 
    ? `${Math.round(calculatedPrice)}€` 
    : (price && price.trim() !== '' ? price : 'Sur devis')
  const displayFirstPrice = calculatedFirstPrice != null ? `${Math.round(calculatedFirstPrice)}€` : null
  
  const directionClass = imageLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'
  const descriptionClassName = `${descriptionTextColor === 'light' ? 'text-white' : 'text-black'}`
  const { data: availability } = useProductAvailability(enableCalendar && productId && hasPrice ? productId : undefined)

  // Convert string dates to Date objects (handle timezone correctly)
  const parseLocalDate = (dateStr: string): Date => {
    // Parse YYYY-MM-DD as local date, not UTC
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const availableDates = useMemo(() => {
    return availability?.availableDates.map(d => parseLocalDate(d)) || []
  }, [availability?.availableDates])

  const unavailableDates = useMemo(() => {
    return availability?.unavailableDates.map(d => parseLocalDate(d)) || []
  }, [availability?.unavailableDates])

  return (
    <div className="w-full" style={color ? { backgroundColor: color } : undefined}>
      <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-12 xl:px-32 2xl:px-0 py-32">
        <div className={`flex ${directionClass} flex-col-reverse gap-16 items-center justify-between`}>
          <div className="w-full max-w-[500px] flex flex-col gap-16 items-center justify-center lg:items-start">
            <h3 className={`${descriptionClassName} w-[85%] sm:w-[600px] lg:w-full text-3xl sm:text-5xl text-center lg:text-left`}>{title}</h3>
            <div className={`${descriptionClassName} text-base`} dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
            <div className="w-full flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-end flex-wrap">
                  {displayFirstPrice && (
                    <h3 className={`text-3xl md:text-5xl whitespace-nowrap line-through ${
                      descriptionTextColor === 'light' ? 'text-red-300' : 'text-red-400'
                    }`}>{displayFirstPrice}</h3>
                  )}
                  <h3 className={`text-3xl md:text-5xl whitespace-nowrap ${
                    hasPrice 
                      ? (descriptionTextColor === 'light' ? 'text-primary' : 'text-black')
                      : 'text-primary'
                  }`}>{displayPrice}</h3>
                </div>
                {infoLabel ? <p className={`text-base wrap-break-word ${descriptionTextColor === 'light' ? 'text-primary' : 'text-black'}`}>{infoLabel}</p> : null}
              </div>

              {/* Calendrier - seulement si prix existe */}
              {hasPrice && enableCalendar && productId && (
                <div className="w-full">
                  <DatePicker
                    date={selectedDate}
                    onSelect={setSelectedDate}
                    availableDates={availableDates}
                    unavailableDates={unavailableDates}
                    placeholder="Sélectionner une date"
                  />
                </div>
              )}

              {/* Sélecteur/Counter et bouton Réserver */}
              <div className="flex items-center justify-between gap-2 w-full">
                {hasPrice && enableQuantity && productId ? (
                  isCounterProduct ? (
                    <Counter 
                      value={peopleCount || 1} 
                      onValueChange={setPeopleCount}
                      min={1}
                      max={1000}
                    />
                  ) : (
                    <Selector 
                      value={peopleCount} 
                      onValueChange={setPeopleCount}
                      placeholder={categoryCode === 'SADAQA' ? 'Quantité' : 'Nombre de personnes...'}
                      label={categoryCode === 'SADAQA' ? 'Quantité' : 'Nombre de personnes au total'}
                      triggerClassName={categoryCode === 'SADAQA' ? 'px-3' : undefined}
                      isSadaqa={categoryCode === 'SADAQA'}
                    />
                  )
                ) : null}
                {hasPrice && productId ? (
                  <CheckoutButton 
                    productId={productId} 
                    label={buttonLabel} 
                    variant="primary" 
                    className="w-fit h-fit shrink-0" 
                    peopleCount={enableQuantity ? (peopleCount || 1) : 1}
                    reservationDate={enableCalendar ? selectedDate : undefined}
                    disabled={enableCalendar ? (!selectedDate || (enableQuantity && peopleCount === undefined)) : (enableQuantity && peopleCount === undefined)}
                  />
                ) : (
                  <Button 
                    label={buttonLabel} 
                    size="sm" 
                    variant="primary" 
                    blur={true} 
                    href="/contact"
                    className="w-fit h-fit shrink-0"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden lg:w-[625px] lg:h-[500px] w-[90%] sm:w-[75%] h-[280px] sm:h-[380px] rounded-3xl border border-black/20">
          <Image
            src={image}
            alt={title}
            width={500}
            height={500}
            className={cn("w-full h-full object-cover", imageClassName)}
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/0 to-black/30 rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HighlightCard


