'use client'

import { openCookiePreferences } from '@/lib/cookies/consent'

export function CookiePreferencesButton({ children }: { children: string }) {
  return (
    <button type="button" onClick={() => openCookiePreferences()} className="text-primary underline">
      {children}
    </button>
  )
}
