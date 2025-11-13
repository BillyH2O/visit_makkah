"use client";
import { Navbar } from "@/components/layout/navbar";
import { heroData } from "@/data/features/visa/hero";
import HeroSection from "@/components/ui/hero/HeroSection";
import { SecondPart } from "@/components/layout/SecondPart";
import { SectionTitle } from "@/components/ui/SectionTitle";
import FormuleStandard from "@/components/features/visa/FormuleStandard";
import EligibilitySimulator from "@/components/features/visa/EligibilitySimulator";
import VisaUploadForm from "@/components/features/visa/VisaUploadForm";

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
        id={heroData.buttons.primary.href}
        id2={heroData.buttons.secondary.href}
      />
        <section id="visa" className="w-full max-w-7xl mx-auto gap-16 px-4 sm:px-6 lg:px-8 py-16">
        <div className="w-full flex flex-col items-center justify-center gap-32">
            <SectionTitle
                label="Offres"
                title="FORMULES VISA"
                text="Choisissez la formule spirituelle qui vous correspond"
            />
            
            <FormuleStandard/>
          
            <SectionTitle
                label="Vérification"
                title="SIMULATEUR D'ÉLIGIBILITÉ"
                text="Vérifiez votre éligibilité pour obtenir un visa saoudien selon votre situation"
            />
            <EligibilitySimulator id="eligibility" />
            
            <SectionTitle
                label="Documents"
                title="ENVOI DE DOCUMENTS"
                text="Téléversez vos documents nécessaires pour votre demande de visa"
            />
            <VisaUploadForm id="visa-documents" />
        </div>

        </section>

        <SecondPart />
    </div>
  )
}