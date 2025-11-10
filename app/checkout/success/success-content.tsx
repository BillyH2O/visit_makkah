"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'

export default function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')

  return (
    <div className="min-h-screen w-full font-sans dark:bg-black">
      <Navbar solid/>
      <div className="relative h-screen w-full max-w-7xl mx-auto flex items-center justify-center p-8">
        <div className="max-w-xl w-full text-center space-y-6">
          <h1 className="text-3xl font-bold">Merci pour votre paiement</h1>
          <p className="text-gray-600 dark:text-gray-300">Votre commande a bien été enregistrée.</p>
          {sessionId ? (
            <p className="text-sm text-gray-500">Référence session: {sessionId}</p>
          ) : null}
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block rounded-full border border-white/5 bg-secondary px-6 py-3 text-white hover:bg-secondary/90"
            >
              Revenir à l’accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


