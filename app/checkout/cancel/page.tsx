"use client";
import MotifStrip from "@/components/ui/MotifStrip";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function CheckoutCancelPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between">
      
      <Navbar solid />
      <div className="max-w-xl w-full text-center space-y-4 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Paiement annulé</h1>
        <p className="text-gray-600 dark:text-gray-300">Vous pouvez réessayer quand vous voulez.</p>
      </div>
      <MotifStrip side="left" color="white" />
      <MotifStrip side="right" color="white" />   
      <div className="w-full bg-black"><Footer /></div>
    </div>
  )
}

