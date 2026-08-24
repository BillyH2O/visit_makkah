import type { Metadata } from 'next'
import { COMPANY, LEGAL_PATHS } from '@/lib/legal/company'
import { LegalLink, LegalPageShell, LegalSection, LegalUpdated } from '@/components/legal/LegalPageShell'
import { CookiePreferencesButton } from '@/components/legal/CookiePreferencesButton'

export const metadata: Metadata = {
  title: 'Politique cookies',
  description: 'Politique cookies de Visit Makkah.',
  alternates: { canonical: LEGAL_PATHS.cookies },
}

export default function PolitiqueCookies() {
  return (
    <LegalPageShell title="POLITIQUE COOKIES" subtitle={`Dernière mise à jour : ${COMPANY.lastUpdated}`}>
      <LegalSection title="1. Cookies nécessaires">
        <p>
          Session, tunnel de paiement Stripe, espace admin et mémorisation de votre choix cookies
          (6 mois). Pas de consentement requis.
        </p>
      </LegalSection>
      <LegalSection title="2. Cookies optionnels">
        <p>
          Aucun cookie de mesure d’audience ou publicitaire n’est déposé aujourd’hui. S’ils étaient
          ajoutés, un consentement explicite (accepter / refuser) serait exigé.
        </p>
        <p>
          Vous pouvez <CookiePreferencesButton>rouvrir le bandeau</CookiePreferencesButton>.
        </p>
      </LegalSection>
      <LegalSection title="3. Documents liés">
        <p>
          <LegalLink href={LEGAL_PATHS.privacy}>Confidentialité</LegalLink> ·{' '}
          <LegalLink href={LEGAL_PATHS.mentions}>Mentions</LegalLink> ·{' '}
          <LegalLink href={LEGAL_PATHS.cgv}>CGV</LegalLink>
        </p>
        <p className="text-sm text-gray-500">{COMPANY.email}</p>
      </LegalSection>
      <LegalUpdated />
    </LegalPageShell>
  )
}
