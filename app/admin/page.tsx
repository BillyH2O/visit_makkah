"use client"
import { useState } from 'react'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'
import OffresAdmin from '@/components/admin/offres/OffresAdmin'
import FaqAdmin from '@/components/admin/faq/FaqAdmin'
import GalleryAdmin from '@/components/admin/gallery/GalleryAdmin'
import SettingsAdmin from '@/components/admin/settings/SettingsAdmin'
import MotifStrip from '@/components/ui/MotifStrip'

type AdminSection = 'offres' | 'faq' | 'gallery' | 'settings'

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('offres')

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-black relative">
      {/* MotifStrip en arrière-plan */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <MotifStrip side="left" color="white" />
        <MotifStrip side="right" color="white" />
      </div>
      
      {/* Contenu en avant-plan */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        <div className="flex items-center justify-between mb-8 w-full">
          <h1 className="text-xl md:text-3xl font-bold">Administration</h1>
          <Link href="/" className="text-sm md:text-base px-2 py-1 md:px-4 md:py-2 rounded-lg bg-black text-white hover:bg-black/90">
            Accueil
          </Link>
        </div>
        <AdminNav activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="mt-8">
          {activeSection === 'offres' && <OffresAdmin />}
          {activeSection === 'faq' && <FaqAdmin />}
          {activeSection === 'gallery' && <GalleryAdmin />}
          {activeSection === 'settings' && <SettingsAdmin />}
        </div>
      </div>
    </div>
  )
}

