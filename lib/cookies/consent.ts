export const CONSENT_STORAGE_KEY = 'visitmakkah_cookie_consent'
export const CONSENT_VERSION = 1

export type CookieConsent = {
  version: number
  necessary: true
  analytics: boolean
  decidedAt: string
}

export function parseConsent(raw: string | null | undefined): CookieConsent | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>
    if (parsed.version !== CONSENT_VERSION || parsed.necessary !== true) return null
    if (typeof parsed.analytics !== 'boolean' || typeof parsed.decidedAt !== 'string') return null
    return {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: parsed.analytics,
      decidedAt: parsed.decidedAt,
    }
  } catch {
    return null
  }
}

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  return parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY))
}

export function persistConsent(analytics: boolean): CookieConsent {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString(),
  }
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent))
  document.cookie = `${CONSENT_STORAGE_KEY}=1; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax`
  return consent
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event('visitmakkah:open-cookie-preferences'))
}
