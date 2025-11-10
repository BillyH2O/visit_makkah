import Image from 'next/image'
import Button from '@/components/ui/MainButton'
import CheckoutButton from '@/components/checkout/CheckoutButton'

type ServiceCardProps = {
    image: string
    title: string
    description: string
    price: string
    infoLabel?: string
    buttonLabel?: string
    productId?: string
}

const ServiceCard = ({ image, title, description, price, infoLabel, buttonLabel = 'Réserver', productId }: ServiceCardProps) => {
  return (
    <div className="w-[344px] flex flex-col items-center justify-center gap-4 text-left">
      <Image src={image} alt={title} width={500} height={500} className="w-full h-[205px] rounded-3xl border-2 border-black/50 object-cover" />
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
        <div className="w-full flex justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl text-primary">{price}</h3>
            {infoLabel ? <p className="text-sm text-primary">{infoLabel}</p> : null}
          </div>
          {productId ? (
            <CheckoutButton productId={productId} label={buttonLabel} className="w-fit h-fit" />
          ) : (
            <Button label={buttonLabel} size="sm" variant="secondary" blur={true} className="w-fit h-fit" />
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceCard


