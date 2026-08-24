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
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] p-4 sm:p-6"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white p-5 text-gray-900 shadow-2xl sm:p-6">
        <h2 id="cookie-banner-title" className="text-base font-semibold text-gray-900">
          Cookies
        </h2>
        <p id="cookie-banner-desc" className="mt-2 text-sm leading-relaxed text-gray-600">
          Nous utilisons des cookies nécessaires à la réservation et au paiement. Aucun cookie
          publicitaire n’est déposé aujourd’hui. Vous pouvez refuser les cookies optionnels aussi
          facilement que les accepter.{' '}
          <Link href={LEGAL_PATHS.cookies} className="text-primary underline underline-offset-2">
            En savoir plus
          </Link>
        </p>
        {customize ? (
          <label className="mt-4 flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            <span>
              <strong>Mesure d’audience (optionnel)</strong>
              <span className="block text-gray-500">
                Inactif : aucun traceur analytique n’est chargé actuellement.
              </span>
            </span>
          </label>
        ) : null}
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => setCustomize((v) => !v)}
            className="h-10 rounded-md px-4 text-sm font-medium text-gray-700 hover:bg-zinc-100"
          >
            {customize ? 'Masquer le détail' : 'Personnaliser'}
          </button>
          <button
            type="button"
            onClick={() => decide(false)}
            className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-gray-900 hover:bg-zinc-50"
          >
            Tout refuser
          </button>
          {customize ? (
            <button
              type="button"
              onClick={() => decide(analytics)}
              className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-black hover:bg-primary/90"
            >
              Enregistrer mes choix
            </button>
          ) : (
            <button
              type="button"
              onClick={() => decide(true)}
              className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-black hover:bg-primary/90"
            >
              Tout accepter
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
