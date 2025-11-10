import { SectionTitle} from '../../../ui/SectionTitle'
import OfferCard from './OfferCard'
import { offersData } from '@/data'
import { useProductsByCategory } from '@/hooks/useProducts'
import Loader from '@/components/ui/Loader'

export const OfferSection = () => {
  // Page d'accueil : afficher toutes les offres (premium incluses)
  const { data: products, loading } = useProductsByCategory('OFFRE')
  return (
    <div className="flex flex-col items-center gap-16 w-full">
      <SectionTitle 
        label={offersData.text.label}
        title={offersData.text.title}
        text={offersData.text.text}
      />
      {loading ? (
        <Loader label="Chargement des offres..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {(products ?? []).map((p) => (
            <OfferCard
              key={p.id}
              imageSrc={p.landingImageUrl || p.imageUrl || '/images/placeholder.png'}
              imageAlt={p.name}
              gradientClassName={p.landingGradientClassName || 'rounded-4xl'}
              title={p.landingTitle || p.name}
              buttonLabel={'Découvrir'}
              productId={p.id}
              productSlug={p.slug}
            />
          ))}
        </div>
      )}
    </div>
  )
}