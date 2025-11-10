import { servicesData } from '@/data'
import { SectionTitle } from '../../../ui/SectionTitle'
import SimpleSlider from './SimpleSlider'
import ServiceCard from './ServiceCard'
import { useProductsByCategory } from '@/hooks/useProducts'
import Loader from '@/components/ui/Loader'

export const ServiceSection = () => {
  const { data: services, loading } = useProductsByCategory('SERVICE')
  return (
    <section className="w-full flex flex-col gap-16">
        <SectionTitle 
        label={servicesData.text.label}
        title={servicesData.text.title}
        text={servicesData.text.text}
        />
        {loading ? (
          <Loader label="Chargement des services..." />
        ) : (
          <SimpleSlider
          className="w-full"
          itemClassName="w-[calc(85%-12px)] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[400px]"
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
          >
          {(services ?? []).map((s) => (
              <ServiceCard
              key={s.id}
              imageSrc={s.imageUrl || '/images/placeholder.png'}
              imageAlt={s.name}
              title={s.landingTitle || s.name}
              bio={s.landingBio || undefined}
              buttonLabel={'En savoir plus'}
              gradientClassName={s.landingGradientClassName || 'rounded-3xl'}
              className="shrink-0"
              productId={s.id}
              productSlug={s.slug}
              />
          ))}
          </SimpleSlider>
        )}
    </section>  
  )
}

export default ServiceSection