import Button from '@/components/ui/MainButton'
import CheckoutButton from '@/components/checkout/CheckoutButton'

type HighlightCardProps = {
  title: string
  descriptionHtml: string
  price?: string
  infoLabel?: string
  buttonLabel?: string
  image: string
  imageLeft?: boolean
  color?: string
  descriptionTextColor?: 'light' | 'dark'
  productId?: string
}

const HighlightCard = ({
  title,
  descriptionHtml,
  price,
  infoLabel,
  buttonLabel = 'Découvrir',
  image,
  imageLeft = false,
  color,
  descriptionTextColor = 'dark',
  productId,
}: HighlightCardProps) => {
  const displayPrice = price && price.trim() !== '' ? price : 'Sur devis'
  const directionClass = imageLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'
  const descriptionClassName = `${descriptionTextColor === 'light' ? 'text-white' : 'text-black'}`

  return (
    <div className="w-full" style={color ? { backgroundColor: color } : undefined}>
      <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-12 xl:px-32 2xl:px-0 sm:p-12 lg:py-32">
        <div className={`flex ${directionClass} flex-col-reverse gap-16 items-center justify-between`}>
          <div className="w-full max-w-[500px] flex flex-col gap-16 items-center justify-center lg:items-start">
            <h3 className={`${descriptionClassName} w-[85%] sm:w-[600px] lg:w-full text-3xl sm:text-5xl text-center lg:text-left`}>{title}</h3>
            <div className={`${descriptionClassName} text-base`} dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
            <div className="w-full flex gap-6 items-end justify-between">
              <div className="flex flex-col gap-2">
                <h3 className="text-5xl text-primary">{displayPrice}</h3>
                {infoLabel ? <p className="text-base text-primary">{infoLabel}</p> : null}
              </div>
              {productId ? (
                <CheckoutButton productId={productId} label={buttonLabel} variant="primary" className="w-fit h-fit" />
              ) : (
                <Button label={buttonLabel} size="sm" variant="primary" blur={true} className="w-fit h-fit"/>
              )}
            </div>
          </div>
          <div
            className="relative bg-cover bg-center flex items-center justify-center lg:w-[425px] lg:h-[500px] w-[90%] sm:w-[75%] h-[280px] sm:h-[380px] rounded-3xl border-2 border-black/20 object-cover"
            style={{ backgroundImage: `url(${image})` }}
          />
        </div>
      </div>
    </div>
  )
}

export default HighlightCard


