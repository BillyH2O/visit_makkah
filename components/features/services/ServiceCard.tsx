import Image from 'next/image'
import { useState, useMemo } from 'react'
import Button from '@/components/ui/MainButton'
import CheckoutButton from '@/components/checkout/CheckoutButton'
import { cn } from '@/lib/utils'
import Selector from '@/components/ui/Selector'
import { DatePicker } from '@/components/ui/DatePicker'
import { useProductAvailability } from '@/hooks/useProductAvailability'
import { calculatePrice } from '@/lib/pricing'
import { useDepositSettings } from '@/hooks/useDepositSettings'
import type { CategoryCode } from '@/types/product'

type ServiceCardProps = {
    image: string
    title: string
    description: string
    firstUnitAmount: number | null
    basePriceEuro: number | null
    infoLabel?: string
    buttonLabel?: string
    productId?: string
    imageClassName?: string
    includedPeople?: number
    extraPerPersonCents?: number
    categoryCode: CategoryCode
}

const ServiceCard = ({ image, title, description, firstUnitAmount, basePriceEuro, infoLabel, buttonLabel = 'Réserver', productId, imageClassName, includedPeople = 0, extraPerPersonCents = 0, categoryCode }: ServiceCardProps) => {
  const [peopleCount, setPeopleCount] = useState<number | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { data: availability } = useProductAvailability(productId)
  const { depositEnabled, depositPercent } = useDepositSettings()
  
  // Vérifier si l'acompte s'applique (OFFRE et SERVICE, pas VISA et SADAQA)
  const showDepositInfo = depositEnabled && (categoryCode === 'OFFRE' || categoryCode === 'SERVICE')

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

  const displayPrice = calculatedPrice != null ? `${Math.round(calculatedPrice)}€` : 'Sur devis'
  const displayFirstPrice = calculatedFirstPrice != null ? `${Math.round(calculatedFirstPrice)}€` : null
  return (
    <div className="w-[344px] flex flex-col items-center justify-center gap-4 text-left overflow-hidden min-h-[600px]">
      <Image src={image} alt={title} width={500} height={500} className={cn("w-full h-[205px] rounded-3xl border-2 border-black/50 object-cover", imageClassName)} />
      <div className="w-full flex flex-col justify-center gap-4 min-w-0 flex-1">
        <h3
          className="text-2xl leading-8 min-h-[64px] overflow-hidden"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
        >
          {title}
        </h3>
        <div
          className="text-sm leading-5"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-end flex-wrap">
              {displayFirstPrice && displayPrice !== 'Sur devis' && (
                <h3 className="text-3xl text-red-400 font-semibold line-through whitespace-nowrap">{displayFirstPrice}</h3>
              )}
              <h3 className="text-3xl text-primary font-semibold whitespace-nowrap">{displayPrice}</h3>
            </div>
            <div className="min-h-[20px]">
              {infoLabel ? <p className="text-sm text-primary wrap-break-word">{infoLabel}</p> : null}
              {showDepositInfo && (
                <p className="text-xs text-primary/80 wrap-break-word mt-1">
                  * Paiement de {depositPercent}% d&apos;acompte. Le reste sera à payer sur place.
                </p>
              )}
            </div>
          </div>

          {/* Calendrier */}
          {productId && (
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

          {/* Compteur et bouton Réserver */}
          <div className="flex items-center justify-between gap-2 w-full">
            <Selector 
              value={peopleCount}
              onValueChange={setPeopleCount}
              placeholder={title.toLowerCase().includes('hôtel') || title.toLowerCase().includes('transport') ? 'Nombre de véhicules' : 'Nombre de personnes...'}
              label={title.toLowerCase().includes('hôtel') || title.toLowerCase().includes('transport') ? 'Nombre de véhicules' : 'Nombre de personnes au total'}
              isTransport={title.toLowerCase().includes('hôtel') || title.toLowerCase().includes('transport')}
            />          
          {productId ? (
              <CheckoutButton 
                productId={productId} 
                label={buttonLabel} 
                className="w-fit h-fit shrink-0" 
                peopleCount={peopleCount || 1} 
                reservationDate={selectedDate}
                disabled={!selectedDate || peopleCount === undefined}
              />
          ) : (
              <Button label={buttonLabel} size="sm" variant="secondary" blur={true} className="w-fit h-fit shrink-0" />
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard


