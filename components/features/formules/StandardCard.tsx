import Image from 'next/image'
import React, { useState, useMemo } from 'react'
import Button from '../../ui/MainButton'
import CheckoutButton from '@/components/checkout/CheckoutButton'
import PeopleCountSelect from '@/components/ui/PeopleCountSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { useProductAvailability } from '@/hooks/useProductAvailability'
import { cn } from '@/lib/utils'

type Description = {
    title: string
    image: string
    description: string | string[]
    color: string
    firstPrice: string
    basePriceEuro: number | null
    buttonLabel: string
    productId?: string
    imageClassName?: string
    infoLabel?: string
    includedPeople?: number
    extraPerPersonCents?: number
    enableCalendar?: boolean
}

const StandardCard = ({title, image, description, color, firstPrice, basePriceEuro, buttonLabel, productId, imageClassName, infoLabel, includedPeople = 0, extraPerPersonCents = 0, enableCalendar = true}: Description) => {
  const [peopleCount, setPeopleCount] = useState<number | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { data: availability } = useProductAvailability(enableCalendar && productId ? productId : undefined)

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

  const displayPrice = calculatedPrice != null ? String(Math.round(calculatedPrice)) : 'Sur devis'

  return (
    <div className="flex gap-16 items-center justify-center">
        <div 
          className="max-w-[370px] w-full flex flex-col gap-6 p-5 rounded-3xl border-2 border-primary overflow-hidden"
          style={{ backgroundColor: color }}
        >
            <Image src={image} alt="Formule Standard" width={500} height={500} className={cn("w-full max-w-[330px] h-[257px] rounded-3xl border-2 border-black/50 object-cover", imageClassName)} />
            <h3 className="w-full text-xl font-semibold wrap-break-word">{title}</h3>
            {(() => {
              const html = Array.isArray(description) ? description.join('') : description
              return <div className="w-full max-text-sm overflow-hidden" dangerouslySetInnerHTML={{ __html: html }} />
            })()}
            
            {/* Prix promo, prix réel et label metadata */}
            <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-end flex-wrap">
                    {firstPrice && firstPrice.trim() !== '' && displayPrice !== 'Sur devis' && (
                        <h3 className="text-3xl text-red-400 font-semibold line-through whitespace-nowrap">{firstPrice}€</h3>
                    )}
                    <h3 className="text-3xl text-primary font-semibold whitespace-nowrap">
                      {displayPrice === 'Sur devis' ? displayPrice : `${displayPrice}€`}
                    </h3>
                </div>
                {infoLabel ? <p className="text-sm text-primary wrap-break-word">{infoLabel}</p> : null}
            </div>
            
            {/* Calendrier */}
            {enableCalendar && productId && (
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
            
            {/* Sélecteur et bouton Réserver sur la même ligne */}
            <div className="flex items-center justify-between gap-2 w-full">
                <PeopleCountSelect 
                  value={peopleCount} 
                  onValueChange={setPeopleCount}
                />
                {productId ? (
                  <CheckoutButton 
                    productId={productId} 
                    label={buttonLabel} 
                    className="w-fit h-fit shrink-0" 
                    peopleCount={peopleCount || 1} 
                    reservationDate={enableCalendar ? selectedDate : undefined}
                    disabled={enableCalendar ? (!selectedDate || !peopleCount || peopleCount < 1) : (!peopleCount || peopleCount < 1)}
                  />
                ) : (
                  <Button label={buttonLabel} size="sm" variant="secondary" blur={true} className="w-fit h-fit shrink-0"/>
                )}
            </div>
        </div> 
    </div>
  )
}

export default StandardCard