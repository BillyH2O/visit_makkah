"use client";
import { Navbar } from "@/components/layout/navbar";
import { heroData } from "@/data/features/sadaqa/hero";
import HeroSection from "@/components/ui/hero/HeroSection";
import { SecondPart } from "@/components/layout/SecondPart";
import HighlightCard from "@/components/ui/HighlightCard";
import { useProductsByCategory } from "@/hooks/useProducts";
import Loader from "@/components/ui/Loader";

export default function Sadaqa() {
  const { data: products, loading } = useProductsByCategory('SADAQA')
  return (
    <div className="min-h-screen w-full font-sans dark:bg-black">
        <Navbar />
        <HeroSection 
        backgroundImage={heroData.backgroundImage}
        title={heroData.title}
        description={heroData.description}
        button1Label={heroData.buttons.primary.label}
        button2Label={heroData.buttons.secondary.label}
        id={heroData.buttons.primary.href}
        id2={heroData.buttons.secondary.href}
      />
      <div id="sadaqa" className="w-full scroll-mt-24">
        {loading ? (
          <Loader label="Chargement des offres Sadaqa..." />
        ) : (
          (products ?? []).map((p, idx) => {
            const imageClassName = (p.metadata as { imageClassName?: string } | null)?.imageClassName
            // Alterner entre fond noir et blanc
            const isEven = idx % 2 === 0
            const backgroundColor = isEven ? '#000000' : '#FFFFFF'
            const textColor = isEven ? 'light' : 'dark'
            
            return (
              <HighlightCard
                key={p.id}
                title={p.detailTitle || p.name}
                descriptionHtml={p.longDescriptionHtml || ''}
                basePriceEuro={p.unitAmount != null ? p.unitAmount / 100 : null}
                firstUnitAmount={p.firstUnitAmount || null}
                infoLabel={p.infoLabel || undefined}
                image={p.imageUrl || '/images/placeholder.png'}
                imageLeft={idx % 2 === 1}
                color={backgroundColor}
                descriptionTextColor={textColor}
                buttonLabel={"Réserver"}
                productId={p.id}
                enableQuantity={true}
                enableCalendar={false}
                imageClassName={imageClassName}
                categoryCode={p.categoryCode}
                includedPeople={(p.metadata as { includedPeople?: number } | null)?.includedPeople ?? 0}
                extraPerPersonCents={(p.metadata as { extraPerPersonCents?: number } | null)?.extraPerPersonCents ?? 0}
              />
            )
          })
        )}
      </div>
        <SecondPart />
    </div>
  )
}