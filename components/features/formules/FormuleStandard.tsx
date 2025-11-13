import StandardCard from "@/components/features/formules/StandardCard"
import { useProductsByCategory } from "@/hooks/useProducts"
import Loader from "@/components/ui/Loader"

const FormuleStandard = () => {
  const { data: products, loading } = useProductsByCategory('OFFRE', { isPremium: false })
  return (
    <div className="flex gap-10 items-start justify-center mt-10 flex-wrap">
      {loading ? (
        <Loader label="Chargement des formules..." />
      ) : (
        (products ?? []).map((p, idx) => {
          const euro = p.unitAmount != null ? (p.unitAmount / 100) : null
          const firstEuro = p.firstUnitAmount ? p.firstUnitAmount / 100 : 0
          const imageClassName = (p.metadata as { imageClassName?: string } | null)?.imageClassName
          return (
            <StandardCard
              key={p.id}
              title={p.detailTitle || p.name}
              image={p.imageUrl || '/images/placeholder.png'}
              description={p.longDescriptionHtml || ''}
              color={p.detailColorHex || ["#FDF6E2", "#E9FAFF", "#EDFFF3"][idx % 3]}
              firstPrice={firstEuro > 0 ? String(Math.round(firstEuro)) : ''}
              price={euro != null ? String(Math.round(euro)) : 'Sur devis'}
              buttonLabel={'Réserver'}
              productId={p.id}
              imageClassName={imageClassName}
            />
          )
        })
      )}
    </div>
  )
}

export default FormuleStandard