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
      />
      <div className="w-full">
        {loading ? (
          <Loader label="Chargement des offres Sadaqa..." />
        ) : (
          (products ?? []).map((p, idx) => (
            <HighlightCard
              key={p.id}
              title={p.detailTitle || p.name}
              descriptionHtml={p.longDescriptionHtml || ''}
              price={p.unitAmount != null ? `${(p.unitAmount/100).toString()}€` : undefined}
              infoLabel={p.infoLabel || undefined}
              image={p.imageUrl || '/images/placeholder.png'}
              imageLeft={idx % 2 === 1}
              color={p.detailColorHex || undefined}
              descriptionTextColor={(idx === 0 || idx === 1 || idx === 3) ? 'light' : 'dark'}
              buttonLabel={"Réserver"}
              productId={p.id}
            />
          ))
        )}
      </div>
        <SecondPart />
    </div>
  )
}