import Image from 'next/image'
import { useState, useMemo } from 'react'
import Button from '@/components/ui/MainButton'
import CheckoutButton from '@/components/checkout/CheckoutButton'
import { cn } from '@/lib/utils'
import PeopleCountSelect from '@/components/ui/PeopleCountSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { useProductAvailability } from '@/hooks/useProductAvailability'

type ServiceCardProps = {
    image: string
    title: string
    description: string
    price: string
    infoLabel?: string
    buttonLabel?: string
    productId?: string
    imageClassName?: string
}

const ServiceCard = ({ image, title, description, price, infoLabel, buttonLabel = 'Réserver', productId, imageClassName }: ServiceCardProps) => {
  const [peopleCount, setPeopleCount] = useState<number | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { data: availability } = useProductAvailability(productId)

  // Convert string dates to Date objects
  const availableDates = useMemo(() => {
    return availability?.availableDates.map(d => new Date(d)) || []
  }, [availability?.availableDates])

  const unavailableDates = useMemo(() => {
    return availability?.unavailableDates.map(d => new Date(d)) || []
  }, [availability?.unavailableDates])
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
          className="text-sm leading-5 min-h-[40px] overflow-hidden"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl text-primary whitespace-nowrap">{price}</h3>
            <div className="min-h-[20px]">
              {infoLabel ? <p className="text-sm text-primary wrap-break-word">{infoLabel}</p> : null}
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

          {/* Sélecteur et bouton Réserver */}
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


