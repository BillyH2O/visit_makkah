import Image from 'next/image'
import React, { useState } from 'react'
import Button from '../../ui/MainButton'
import CheckoutButton from '@/components/checkout/CheckoutButton'

type Description = {
    title: string
    image: string
    description: string | string[]
    color: string
    firstPrice: string
    price: string
    buttonLabel: string
    productId?: string
}

const StandardCard = ({title, image, description, color, firstPrice, price, buttonLabel, productId}: Description) => {
  const [peopleCount, setPeopleCount] = useState<number>(1)
  return (
    <div className="flex gap-16 items-center justify-center">
        <div 
          className="max-w-[370px] w-full flex flex-col gap-6 p-5 rounded-3xl border-2 border-primary"
          style={{ backgroundColor: color }}
        >
            <Image src={image} alt="Formule Standard" width={500} height={500} className="w-[330px] h-[257px] rounded-3xl border-2 border-black/50 object-cover" />
            <h3 className="w-full text-xl font-semibold">{title}</h3>
            {(() => {
              const html = Array.isArray(description) ? description.join('') : description
              return <div className="w-full max-text-sm" dangerouslySetInnerHTML={{ __html: html }} />
            })()}
            <div className="flex gap-6 items-end justify-between">
                <div className="flex gap-2 items-end">
                    {firstPrice && firstPrice.trim() !== '' && (
                        <h3 className="text-3xl text-red-400 font-semibold line-through">{firstPrice}€</h3>
                    )}
                    <h3 className="text-3xl text-primary font-semibold">{price}€</h3>
                </div>
                <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <input
                    type="number"
                    min={1}
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-12 px-2 py-1 rounded-md border border-black/20 text-sm"
                  />
                </div>
                {productId ? (
                  <CheckoutButton productId={productId} label={buttonLabel} className="w-fit h-fit" peopleCount={peopleCount} />
                ) : (
                  <Button label={buttonLabel} size="sm" variant="secondary" blur={true} className="w-fit h-fit"/>
                )}
                </div>
            </div>
        </div> 
    </div>
  )
}

export default StandardCard