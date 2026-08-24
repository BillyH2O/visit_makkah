import type { ReactNode } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import MotifStrip from '@/components/ui/MotifStrip'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { COMPANY } from '@/lib/legal/company'

export function LegalPageShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="relative min-h-screen w-full font-sans dark:bg-black">
      <Navbar solid />
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
        <div className="w-full flex flex-col items-center justify-center gap-16">
          <SectionTitle label="Informations" title={title} text={subtitle} />
          <div className="w-full space-y-8 text-black dark:text-white leading-relaxed">{children}</div>
        </div>
      </section>
      <MotifStrip side="left" color="white" />
      <MotifStrip side="right" color="white" />
      <div className="w-full bg-black">
        <Footer />
      </div>
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-primary underline">
      {children}
    </Link>
  )
}

export function LegalUpdated() {
  return <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">Dernière mise à jour : {COMPANY.lastUpdated}</p>
}
