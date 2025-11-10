import StandardCard from "@/components/features/formules/StandardCard"
import { useProductsByCategory } from "@/hooks/useProducts"

const FormuleStandard = () => {
  const { data: products } = useProductsByCategory('VISA')
  return (
    <div className="flex gap-10 items-start justify-center mt-10 flex-wrap">
      {(products ?? []).map((p, idx) => {
        const euro = (p.unitAmount ?? 0) / 100
        const firstEuro = p.firstUnitAmount ? p.firstUnitAmount / 100 : 0
        return (
          <StandardCard
            key={p.id}
            title={p.detailTitle || p.name}
            image={p.imageUrl || '/images/placeholder.png'}
            description={p.longDescriptionHtml || ''}
            color={p.detailColorHex || ["#E8EFF5", "#F3EFE1", "#F9E9D6"][idx % 3]}
            firstPrice={firstEuro > 0 ? String(Math.round(firstEuro)) : ''}
            price={String(Math.round(euro))}
            buttonLabel={'Réserver'}
            productId={p.id}
          />
        )
      })}
    </div>
  )
}

export default FormuleStandard