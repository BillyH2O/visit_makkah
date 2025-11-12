"use client";
import { Navbar } from "@/components/layout/navbar";
import { heroData } from "@/data/features/formules/hero";
import HeroSection from "@/components/ui/hero/HeroSection";
import { SecondPart } from "@/components/layout/SecondPart";
import { SectionTitle } from "@/components/ui/SectionTitle";
import FormulePremium from "@/components/features/formules/FormulePremium";
import FormuleStandard from "@/components/features/formules/FormuleStandard";
import MotifStrip from "@/components/ui/MotifStrip";

export default function Formules() {
  return (
    <div className="min-h-screen w-full font-sans dark:bg-black">
        <Navbar />
        <HeroSection 
        backgroundImage={heroData.backgroundImage}
        title={heroData.title}
        description={heroData.description}
        button1Label={heroData.buttons.primary.label}
        button2Label={heroData.buttons.secondary.label}
        id="formules"
      />
        <div className="relative w-full h-full">
        <section id="formules" className="relative w-full max-w-7xl mx-auto gap-16 px-4 sm:px-6 lg:px-8 py-32">
            <div className="w-full flex flex-col items-center justify-center gap-32">
                <SectionTitle
                    label="Offres"
                    title="FORMULES OMRA"
                    text="Choisissez la formule spirituelle qui vous correspond. Nous vous accompagnons dans votre projet. "
                />
                <FormulePremium/>
                <FormuleStandard/>
            </div>
        </section>
        <MotifStrip side="left" />
        <MotifStrip side="right" />
        </div>
        <SecondPart />
    </div>
  )
}