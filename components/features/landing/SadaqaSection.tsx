import { SectionTitle } from '../../ui/SectionTitle'
import OfferCard from './offer/OfferCard'
import { sadaqaData } from '@/data'
import { useProductsByCategory } from '@/hooks/useProducts'

export const SadaqaSection = () => {
  const { data: products } = useProductsByCategory('SADAQA', { limit: 3 })
  return (
    <section className="w-full flex flex-col items-center gap-16">
      <SectionTitle 
        label={sadaqaData.text.label}
        title={sadaqaData.text.title}
        text={sadaqaData.text.text}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {(products ?? []).map((p) => {
          const imageClassName = (p.metadata as { imageClassName?: string } | null)?.imageClassName
          return (
            <OfferCard
              key={p.id}
              sizeClassName="h-[330px]"
              className="w-full"
              imageSrc={p.imageUrl || '/images/placeholder.png'}
              imageAlt={p.name}
              gradientClassName={p.landingGradientClassName || 'rounded-4xl'}
              title={p.landingTitle || p.name}
              buttonLabel={'Découvrir'}
              baseHref="/sadaqa"
              imageClassName={imageClassName}
            />
          )
        })}
      </div>
    </section>
  )
}

export default SadaqaSection


