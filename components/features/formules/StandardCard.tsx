import Image from 'next/image'
import React, { useState, useMemo } from 'react'
import Button from '../../ui/MainButton'
import CheckoutButton from '@/components/checkout/CheckoutButton'
import Selector from '@/components/ui/Selector'
import { DatePicker } from '@/components/ui/DatePicker'
import { useProductAvailability } from '@/hooks/useProductAvailability'
import { cn } from '@/lib/utils'
import { calculatePrice } from '@/lib/pricing'
import { useDepositSettings } from '@/hooks/useDepositSettings'
import type { CategoryCode } from '@/types/product'

type Description = {
    title: string
    image: string
    description: string | string[]
    color: string
    firstUnitAmount: number | null
    basePriceEuro: number | null
    buttonLabel: string
    productId?: string
    imageClassName?: string
    infoLabel?: string
    includedPeople?: number
    extraPerPersonCents?: number
    enableCalendar?: boolean
    categoryCode: CategoryCode
}

const StandardCard = ({title, image, description, color, firstUnitAmount, basePriceEuro, buttonLabel, productId, imageClassName, infoLabel, includedPeople = 0, extraPerPersonCents = 0, enableCalendar = true, categoryCode}: Description) => {
  const [peopleCount, setPeopleCount] = useState<number | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { data: availability } = useProductAvailability(enableCalendar && productId ? productId : undefined)
  const { depositEnabled, depositPercent } = useDepositSettings()

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

  // Calcul du prix promotionnel dynamique selon le nombre de personnes
  const baseFirstPriceEuro = firstUnitAmount != null ? firstUnitAmount / 100 : null
  const calculatedFirstPrice = useMemo(() => {
    return calculatePrice(baseFirstPriceEuro, peopleCount, includedPeople, extraPerPersonCents)
  }, [baseFirstPriceEuro, peopleCount, includedPeople, extraPerPersonCents])

  // Calcul du prix dynamique selon le nombre de personnes
  const calculatedPrice = useMemo(() => {
    return calculatePrice(basePriceEuro, peopleCount, includedPeople, extraPerPersonCents)
  }, [basePriceEuro, peopleCount, includedPeople, extraPerPersonCents])

  const displayPrice = calculatedPrice != null ? String(Math.round(calculatedPrice)) : 'Sur devis'
  const displayFirstPrice = calculatedFirstPrice != null ? String(Math.round(calculatedFirstPrice)) : null
  
  // Vérifier si l'acompte s'applique (OFFRE et SERVICE, pas VISA et SADAQA)
  const showDepositInfo = depositEnabled && (categoryCode === 'OFFRE' || categoryCode === 'SERVICE')

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
                    {displayFirstPrice && displayPrice !== 'Sur devis' && (
                        <h3 className="text-3xl text-red-400 font-semibold line-through whitespace-nowrap">{displayFirstPrice}€</h3>
                    )}
                    <h3 className="text-3xl text-primary font-semibold whitespace-nowrap">
                      {displayPrice === 'Sur devis' ? displayPrice : `${displayPrice}€`}
                    </h3>
                </div>
                {infoLabel ? <p className="text-sm text-primary wrap-break-word">{infoLabel}</p> : null}
                {showDepositInfo && (
                  <p className="text-xs text-primary/80 wrap-break-word">
                    * Paiement de {depositPercent}% d&apos;acompte. Le reste sera à payer sur place.
                  </p>
                )}
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
            
            {/* Compteur et bouton Réserver sur la même ligne */}
            <div className="flex items-center justify-between gap-2 w-full">
                <Selector 
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