"use client";
import { Navbar } from "@/components/layout/navbar";
import { heroData } from "@/data/features/services/hero";
import HeroSection from "@/components/ui/hero/HeroSection";
import { SecondPart } from "@/components/layout/SecondPart";
import { SectionTitle } from "@/components/ui/SectionTitle";
import HighlightCard from "@/components/ui/HighlightCard";
import ServicesStandard from "@/components/features/services/ServicesStandard";
import { useProductsByCategory } from "@/hooks/useProducts";
import Loader from "@/components/ui/Loader";
import MotifStrip from "@/components/ui/MotifStrip";

export default function Services() {
  const { data: highlightProducts, loading: highlightLoading } = useProductsByCategory('SERVICE', { isHighlight: true, limit: 1 });

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
       <div className="relative w-full h-full">
        <section id="services" className="relative w-full max-w-6xl 2xl:max-w-7xl mx-auto gap-16 px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative w-full flex flex-col items-center justify-center gap-32">
          <SectionTitle
              label="Services"
              title="NOS SERVICES"
              text="Nous vous accompagnons dans vos démarches, vos formules Omra et vos visites légiférées en Arabie Saoudite."
          />
          {highlightLoading ? (
            <Loader label="Chargement du service mis en avant..." />
          ) : highlightProducts && highlightProducts.length > 0 ? (
            highlightProducts.map((p) => (
              <HighlightCard
                key={p.id}
                title={p.detailTitle || p.name}
                descriptionHtml={p.longDescriptionHtml || ''}
                price={p.unitAmount != null ? `${(p.unitAmount/100).toString()}€` : undefined}
                infoLabel={p.infoLabel || undefined}
                buttonLabel="Découvrir"
                image={p.imageUrl || '/images/placeholder.png'}
                descriptionTextColor="dark"
                productId={p.id}
              />
            ))
          ) : null}
          <ServicesStandard />
        </div>
        </section>
        <MotifStrip side="left" />
        <MotifStrip side="right" />
       </div>
        <SecondPart />
    </div>
  )
}