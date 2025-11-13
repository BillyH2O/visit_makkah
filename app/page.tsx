"use client";
import HeroSection from "@/components/ui/hero/HeroSection";
import { Navbar } from "@/components/layout/navbar";
import { OfferSection } from "@/components/features/landing/offer/OfferSection";
import { ServiceSection } from "@/components/features/landing/service/ServiceSection";
import { SadaqaSection } from "@/components/features/landing/SadaqaSection";
import MotifStrip from "@/components/ui/MotifStrip";
import { VideoExpansionTextBlend } from "@/components/features/landing/video/Video";
import PresentationSection from "@/components/features/landing/presentation/PresentationSection";
import { Cloud } from "@/components/ui/hero/Cloud";
import { SecondPart } from "@/components/layout/SecondPart";
import { heroData } from "@/data";

export default function Home() {
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
      <Cloud />
      <div className="relative w-full h-full">
        <section className="w-full py-16 mx-auto max-w-7xl px-4 sm:px-12 xl:px-32 2xl:px-0 flex flex-col items-center justify-center gap-64 relative">
          <OfferSection />
          <ServiceSection />
          <SadaqaSection />
        </section>
        <MotifStrip side="left" />
        <MotifStrip side="right" />
      </div>

      <VideoExpansionTextBlend />
      <PresentationSection />

      <SecondPart />
    </div>
  );
}