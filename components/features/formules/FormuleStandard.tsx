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
          const euro = (p.unitAmount ?? 0) / 100
          const firstEuro = p.firstUnitAmount ? p.firstUnitAmount / 100 : 0
          return (
            <StandardCard
              key={p.id}
              title={p.detailTitle || p.name}
              image={p.imageUrl || '/images/placeholder.png'}
              description={p.longDescriptionHtml || ''}
              color={p.detailColorHex || ["#FDF6E2", "#E9FAFF", "#EDFFF3"][idx % 3]}
              firstPrice={firstEuro > 0 ? String(Math.round(firstEuro)) : ''}
              price={String(Math.round(euro))}
              buttonLabel={'Réserver'}
              productId={p.id}
            />
          )
        })
      )}
    </div>
  )
}

export default FormuleStandard