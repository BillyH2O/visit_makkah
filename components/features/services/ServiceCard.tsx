import Image from 'next/image'
import { useState } from 'react'
import Button from '@/components/ui/MainButton'
import CheckoutButton from '@/components/checkout/CheckoutButton'
import { cn } from '@/lib/utils'

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
    <div className="w-[344px] flex flex-col items-center justify-center gap-4 text-left">
      <Image src={image} alt={title} width={500} height={500} className={cn("w-full h-[205px] rounded-3xl border-2 border-black/50 object-cover", imageClassName)} />
      <div className="w-full flex flex-col justify-center gap-4">
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
        <div className="w-full flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl text-primary">{price}</h3>
            {infoLabel ? <p className="text-sm text-primary">{infoLabel}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Personnes</label>
            <input
              type="number"
              min={1}
              value={peopleCount}
              onChange={(e) => setPeopleCount(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 px-2 py-1 rounded-md border border-black/20 text-sm"
            />
          </div>
          {productId ? (
            <CheckoutButton productId={productId} label={buttonLabel} className="w-fit h-fit" peopleCount={peopleCount} />
          ) : (
            <Button label={buttonLabel} size="sm" variant="secondary" blur={true} className="w-fit h-fit" />
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceCard


