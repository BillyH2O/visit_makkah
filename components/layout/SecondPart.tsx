import { CtaSection } from "../features/landing/CtaSection"
import FaqSection from "../features/landing/faq/FaqSection"
import { GallerySection } from "../features/landing/gallery/GallerySection"
import { UpsellSection } from "../features/landing/upsell/UpsellSection"
import { Footer } from "./footer"
import { TestimonialSection } from "../features/landing/avis/TestimonalSection"
import MotifDoor from "../ui/MotifDoor"
import Image from "next/image"

export const SecondPart = () => {
  return (
    <>
      <div className="relative w-full h-full">
        <div className="relative w-full h-full">
              <div className="relative w-full flex flex-col items-center justify-center gap-24 border-y border-b-3 border-b-green-500/10">
              <FaqSection />
              <Image src="/images/Nabawi.png" alt="Motif" width={100} height={100} className="absolute right-0 -bottom-7 object-cover" />
              </div>
              <TestimonialSection />
          <Image src="/images/Kaaba.png" alt="Motif" width={100} height={100} className="absolute left-0 bottom-0 object-cover" />
        </div>  
        <div className="bg-[#000904] relative w-full h-full">
            <section className="w-full mx-auto max-w-7xl px-4 sm:px-12 xl:px-32 2xl:px-0 sm:p-12 lg:py-32 flex flex-col items-center justify-center gap-64 relative z-20">
                <GallerySection />
                <CtaSection />
                <UpsellSection />
            </section>
        </div>
        <MotifDoor side="left" />
        <MotifDoor side="right" />
      </div>
      <Footer />
    </>
  )
}