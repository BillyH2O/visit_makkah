import CheckoutButton from '@/components/checkout/CheckoutButton'
import { useProductsByCategory } from '@/hooks/useProducts'
import Loader from '@/components/ui/Loader'
import Image from 'next/image'

export default function Premium() {
  const { data: products, loading } = useProductsByCategory('OFFRE', { isPremium: true })

  if (loading) {
    return <Loader label="Chargement de la formule premium..." />
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="w-full flex flex-col gap-16 items-center justify-center">
      {products.map((p) => {
        const priceEuro = p.unitAmount != null ? Math.round(p.unitAmount / 100) : undefined
        return (
          <div key={p.id} className="w-full flex flex-col-reverse lg:flex-row gap-16 items-center justify-center">
            <div className="w-full flex flex-col gap-12 items-center justify-center lg:items-start">
              <h3 className="w-[85%] sm:w-[600px] lg:w-full text-3xl sm:text-5xl text-center lg:text-left">
                {p.detailTitle || p.name}
              </h3>
              <div className="text-base w-full max-w-[700px]">
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-2 [&_li]:ml-4"
                  dangerouslySetInnerHTML={{ __html: p.longDescriptionHtml || '' }}
                />
              </div>
              <div className="w-[75%] flex justify-between items-end">
                <div className="flex flex-col gap-2 ">
                  {priceEuro != null && (
                    <h3 className="text-5xl text-primary font-semibold">{priceEuro}€</h3>
                  )}
                  {p.infoLabel ? (
                    <p className="text-base text-primary">{p.infoLabel}</p>
                  ) : null}
                </div>
                <CheckoutButton productId={p.id} label="Réserver" />
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <Image src={p.imageUrl || '/images/placeholder.png'} alt={p.detailTitle || p.name} width={480} height={580} className="lg:w-[780px] w-[380px] h-auto rounded-3xl object-cover" />
            </div>
          </div>
        )
      })}
    </div>
  )
}