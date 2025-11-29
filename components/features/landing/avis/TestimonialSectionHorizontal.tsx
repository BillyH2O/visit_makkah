"use client";

import { motion } from "framer-motion";
import { TestimonialItem, useTestimonials } from "@/hooks/useTestimonials";
import { SectionTitle } from "../../../ui/SectionTitle";
import { TestimonialsRow } from "./testimonials-rows-1";
import Loader from "@/components/ui/Loader";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


const sliceRows = (arr: TestimonialItem[]) => {
  const third = Math.ceil(arr.length / 3)
  const first = arr.slice(0, third)
  const second = arr.slice(third, third * 2)
  const thirdRow = arr.slice(third * 2)
  return { first, second, third: thirdRow }
}


export const TestimonialSectionHorizontal = () => {
  const { data, loading } = useTestimonials()
  const { first, second, third } = sliceRows(data ?? [])
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
        <div className="container z-10 mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
          >
          </motion.div>

          <div className="flex flex-col justify-center gap-6 mt-10 [mask-image:linear-gradient(to_right,transparent,black_25%,black_75%,transparent)] w-full overflow-hidden">
            <TestimonialsRow testimonials={first} duration={50} />
            <TestimonialsRow testimonials={second} className="hidden md:block" duration={55} />
            <TestimonialsRow testimonials={third} className="hidden lg:block" duration={52} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex justify-center mt-12"
          >
            <Link
              href="/avis"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Voir tous les avis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      )}
    </section>
  );
};

