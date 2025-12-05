import StandardCard from "@/components/features/formules/StandardCard"
import { useProductsByCategory } from "@/hooks/useProducts"

const FormuleStandard = () => {
  const { data: products } = useProductsByCategory('VISA')
  return (
    <div className="flex gap-10 items-start justify-center mt-10 flex-wrap">
      {(products ?? []).map((p, idx) => {
        const euro = p.unitAmount != null ? (p.unitAmount / 100) : null
        const imageClassName = (p.metadata as { imageClassName?: string } | null)?.imageClassName
        const metadata = p.metadata as { includedPeople?: number; extraPerPersonCents?: number } | null
        const includedPeople = metadata?.includedPeople ?? 0
        const extraPerPersonCents = metadata?.extraPerPersonCents ?? 0
        return (
          <StandardCard
            key={p.id}
            title={p.detailTitle || p.name}
            image={p.imageUrl || '/images/placeholder.png'}
            description={p.longDescriptionHtml || ''}
            color={p.detailColorHex || ["#E8EFF5", "#F3EFE1", "#F9E9D6"][idx % 3]}
            firstUnitAmount={p.firstUnitAmount || null}
            basePriceEuro={euro}
            buttonLabel={'Réserver'}
            productId={p.id}
            imageClassName={imageClassName}
            infoLabel={p.infoLabel || undefined}
            includedPeople={includedPeople}
            extraPerPersonCents={extraPerPersonCents}
            enableCalendar={false}
            categoryCode={p.categoryCode}
          />
        )
      })}
    </div>
  )
}

export default FormuleStandard