import ServiceCard from '@/components/features/services/ServiceCard'
import { useProductsByCategory } from '@/hooks/useProducts'
import Loader from '@/components/ui/Loader'

const ServicesStandard = () => {
  const { data: products, loading } = useProductsByCategory('SERVICE')
  return (
    <div className="w-full flex flex-wrap items-start justify-center gap-10">
      {loading ? (
        <Loader label="Chargement des services..." />
      ) : (
        (products ?? []).map((p) => (
          <ServiceCard
            key={p.id}
            image={p.imageUrl || '/images/placeholder.png'}
            title={p.detailTitle || p.name}
            description={p.longDescriptionHtml || ''}
            price={p.unitAmount != null ? `${(p.unitAmount/100).toString()}€` : 'Sur devis'}
            infoLabel={p.infoLabel || undefined}
            buttonLabel={'Réserver'}
            productId={p.id}
          />
        ))
      )}
    </div>
  )
}

export default ServicesStandard


