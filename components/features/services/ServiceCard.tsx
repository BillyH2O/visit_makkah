import Image from 'next/image'
import { useState } from 'react'
import Button from '@/components/ui/MainButton'
import CheckoutButton from '@/components/checkout/CheckoutButton'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [peopleCount, setPeopleCount] = useState<number>(1)
  return (
    <div className="w-[344px] flex flex-col items-center justify-center gap-4 text-left overflow-hidden">
      <Image src={image} alt={title} width={500} height={500} className={cn("w-full h-[205px] rounded-3xl border-2 border-black/50 object-cover", imageClassName)} />
      <div className="w-full flex flex-col justify-center gap-4 min-w-0">
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
        <div className="w-full flex justify-between items-start gap-2 min-w-0">
          <div className="flex flex-col gap-2 min-w-0 flex-shrink">
            <h3 className="text-3xl text-primary whitespace-nowrap">{price}</h3>
            {infoLabel ? <p className="text-sm text-primary break-words">{infoLabel}</p> : null}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Select value={String(peopleCount)} onValueChange={(value) => setPeopleCount(Number(value))}>
              <SelectTrigger className="w-16 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Nombre de personnes au total</SelectLabel>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>          
          {productId ? (
            <CheckoutButton productId={productId} label={buttonLabel} className="w-fit h-fit flex-shrink-0" peopleCount={peopleCount} />
          ) : (
            <Button label={buttonLabel} size="sm" variant="secondary" blur={true} className="w-fit h-fit flex-shrink-0" />
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard


