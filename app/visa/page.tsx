"use client";
import { Navbar } from "@/components/layout/navbar";
import { heroData } from "@/data/features/visa/hero";
import HeroSection from "@/components/ui/hero/HeroSection";
import { SecondPart } from "@/components/layout/SecondPart";
import { SectionTitle } from "@/components/ui/SectionTitle";
import FormuleStandard from "@/components/features/visa/FormuleStandard";
import EligibilitySimulator from "@/components/features/visa/EligibilitySimulator";

export default function Visa() {
  return (
    <div className="min-h-screen w-full font-sans dark:bg-black">
        <Navbar />
        <HeroSection 
        backgroundImage={heroData.backgroundImage}
        title={heroData.title}
        description={heroData.description}
        button1Label={heroData.buttons.primary.label}
        button2Label={heroData.buttons.secondary.label}
        id="visa"
        id2="eligibility"
      />
        <section id="visa" className="w-full max-w-7xl mx-auto gap-16 px-4 sm:px-6 lg:px-8 py-16">
        <div className="w-full flex flex-col items-center justify-center gap-32">
            <SectionTitle
                label="Offres"
                title="FORMULES VISA"
                text="Choisissez la formule spirituelle qui vous correspond"
            />
            
            <FormuleStandard/>
            <EligibilitySimulator id="eligibility" />
        </div>

        </section>

        <SecondPart />
    </div>
  )
}