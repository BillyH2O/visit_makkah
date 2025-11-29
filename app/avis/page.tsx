"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useTestimonials } from '@/hooks/useTestimonials'
import Loader from '@/components/ui/Loader'
import MotifStrip from "@/components/ui/MotifStrip"

export default function AvisPage() {
  const { data: testimonials, loading, error } = useTestimonials()

  return (
    <div className="relative min-h-screen w-full font-sans dark:bg-black">
      <Navbar solid />
      <MotifStrip side="left" color="white" />
      <MotifStrip side="right" color="white" />
      
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <Loader label="Chargement des avis..." />
        </div>
      ) : error ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Erreur</h1>
            <p className="text-gray-600">Impossible de charger les avis.</p>
          </div>
        </div>
      ) : !testimonials || testimonials.length === 0 ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Aucun avis disponible</h1>
            <p className="text-gray-600">Il n&apos;y a pas encore d&apos;avis à afficher.</p>
          </div>
        </div>
      ) : (
        <div className="relative py-16 px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Avis Clients</h1>
              <p className="text-gray-400 text-lg">Découvrez les témoignages de nos pèlerins</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-primary/30 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="mb-4">
                    <svg 
                      className="w-8 h-8 text-primary mb-3" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l1.017.52c-4.504.902-7.996 4.135-7.996 9.477V21h-2zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l1.017.52c-4.504.902-8 4.135-8 9.477V21h-1.017z"/>
                    </svg>
                  </div>
                  <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-6 whitespace-pre-wrap min-h-[120px]">
                    {testimonial.text}
                  </p>
                  <div className="pt-4 border-t border-primary/20">
                    <div className="font-bold text-lg text-primary dark:text-primary">
                      {testimonial.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full bg-black">
        <Footer />
      </div>
    </div>
  )
}

