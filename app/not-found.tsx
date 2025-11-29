"use client"

import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import MotifStrip from "@/components/ui/MotifStrip"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full font-sans dark:bg-black">
      <Navbar solid />
      <MotifStrip side="left" color="white" />
      <MotifStrip side="right" color="white" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold text-primary/20 select-none">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Page introuvable
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-2">
              Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
            </p>
            <p className="text-base text-gray-500">
              Il se peut que l&apos;URL soit incorrecte ou que la page ait été supprimée.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              Retour à l&apos;accueil
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors font-medium border border-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Page précédente
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="mt-16 pt-8 border-t border-secondary/20">
            <p className="text-sm text-gray-500">
              Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur,{" "}
              <Link href="/contact" className="text-primary hover:text-primary/80 underline">
                contactez-nous
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="w-full bg-black relative z-10">
        <Footer />
      </div>
    </div>
  )
}

