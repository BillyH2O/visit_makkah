'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { LEGAL_PATHS } from '@/lib/legal/company'
import { getStoredConsent, persistConsent } from '@/lib/cookies/consent'

const OPEN_EVENT = 'visitmakkah:open-cookie-preferences'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [customize, setCustomize] = useState(false)
  const [analytics, setAnalytics] = useState(false)

  const hide = useCallback(() => {
    setVisible(false)
    setCustomize(false)
    document.documentElement.classList.remove('cookie-banner-visible')
  }, [])

  useEffect(() => {
    if (getStoredConsent()) {
      hide()
      return
    }
    setVisible(true)
    document.documentElement.classList.add('cookie-banner-visible')
  }, [hide])

  useEffect(() => {
    const reopen = () => {
      setAnalytics(getStoredConsent()?.analytics ?? false)
      setCustomize(true)
      setVisible(true)
      document.documentElement.classList.add('cookie-banner-visible')
    }
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [])

  const decide = (next: boolean) => {
    persistConsent(next)
    hide()
  }

  if (!visible) return null

  return (
    <div role="dialog" aria-labelledby="cookie-banner-title" className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/20 bg-black p-5 text-white shadow-2xl sm:p-6">
        <h2 id="cookie-banner-title" className="text-base font-semibold">Cookies</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          Nous utilisons des cookies nécessaires au compte, à la réservation et au paiement. Aucun
          cookie publicitaire n’est déposé aujourd’hui. Vous pouvez refuser les cookies optionnels
          aussi facilement que les accepter.{' '}
          <Link href={LEGAL_PATHS.cookies} className="underline text-primary">
            En savoir plus
          </Link>
        </p>
        {customize ? (
          <label className="mt-4 flex items-start gap-3 rounded-lg border border-white/15 bg-white/5 p-3 text-sm">
            <input type="checkbox" className="mt-1" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
            <span>
              <strong>Mesure d’audience (optionnel)</strong>
              <span className="block text-white/60">Inactif : aucun traceur analytique n’est chargé actuellement.</span>
            </span>
          </label>
        ) : null}
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setCustomize((v) => !v)} className="h-10 rounded-md px-4 text-sm text-white/80 hover:bg-white/10">
            {customize ? 'Masquer le détail' : 'Personnaliser'}
          </button>
          <button type="button" onClick={() => decide(false)} className="h-10 rounded-md border border-white/30 px-4 text-sm hover:bg-white/10">
            Tout refuser
          </button>
          {customize ? (
            <button type="button" onClick={() => decide(analytics)} className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-black">
              Enregistrer mes choix
            </button>
          ) : (
            <button type="button" onClick={() => decide(true)} className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-black">
              Tout accepter
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
