
"use client";

import { motion } from "framer-motion";
import { TestimonialItem, useTestimonials } from "@/hooks/useTestimonials";
import { SectionTitle } from "../../../ui/SectionTitle";
import { TestimonialsColumn } from "./testimonials-columns-1";
import Loader from "@/components/ui/Loader";


const sliceColumns = (arr: TestimonialItem[]) => {
  const third = Math.ceil(arr.length / 3)
  const first = arr.slice(0, third)
  const second = arr.slice(third, third * 2)
  const thirdCol = arr.slice(third * 2)
  return { first, second, third: thirdCol }
}


export const TestimonialSection = () => {
  const { data, loading } = useTestimonials()
  const { first, second, third } = sliceColumns(data ?? [])
  return (
    <section className="relative w-full mx-auto max-w-7xl px-4 sm:px-12 xl:px-32 2xl:px-0 flex flex-col items-center justify-center gap-24 py-32">
      <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center">
      <SectionTitle 
        label="Avis Client" 
        title="Témoignages" 
        text="Nous sommes fiers de notre travail et de la satisfaction de nos clients. Nous sommes toujours à la recherche de nouvelles façons de nous améliorer et de vous offrir un service de qualité." />
      </div>
      {loading ? (
        <Loader label="Chargement des avis..." />
      ) : (
        <div className="container z-10 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
          >
          </motion.div>

          <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
            <TestimonialsColumn testimonials={first} duration={15} />
            <TestimonialsColumn testimonials={second} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={third} className="hidden lg:block" duration={17} />
          </div>
        </div>
      )}
    </section>
  );
};