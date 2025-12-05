import ServiceCard from '@/components/features/services/ServiceCard'
import { useProductsByCategory } from '@/hooks/useProducts'
import Loader from '@/components/ui/Loader'

const ServicesStandard = () => {
  const { data: products, loading } = useProductsByCategory('SERVICE', { isPremium: false })
  return (
    <div className="w-full flex flex-wrap items-start justify-center gap-10">
      {loading ? (
        <Loader label="Chargement des services..." />
      ) : (
        (products ?? []).map((p) => {
          const euro = p.unitAmount != null ? (p.unitAmount / 100) : null
          const imageClassName = (p.metadata as { imageClassName?: string } | null)?.imageClassName
          const metadata = p.metadata as { includedPeople?: number; extraPerPersonCents?: number } | null
          const includedPeople = metadata?.includedPeople ?? 0
          const extraPerPersonCents = metadata?.extraPerPersonCents ?? 0
          return (
            <ServiceCard
              key={p.id}
              image={p.imageUrl || '/images/placeholder.png'}
              title={p.detailTitle || p.name}
              description={p.longDescriptionHtml || ''}
              firstUnitAmount={p.firstUnitAmount || null}
              basePriceEuro={euro}
              infoLabel={p.infoLabel || undefined}
              buttonLabel={'Réserver'}
              productId={p.id}
              imageClassName={imageClassName}
              includedPeople={includedPeople}
              extraPerPersonCents={extraPerPersonCents}
              categoryCode={p.categoryCode}
            />
          )
        })
      )}
    </div>
  )
}

export default ServicesStandard


