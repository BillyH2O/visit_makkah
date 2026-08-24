import type { Metadata } from 'next'
import { COMPANY, LEGAL_PATHS } from '@/lib/legal/company'
import { LegalLink, LegalPageShell, LegalSection, LegalUpdated } from '@/components/legal/LegalPageShell'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de Visit Makkah : éditeur britannique, hébergeur et informations légales.',
  alternates: { canonical: LEGAL_PATHS.mentions },
}

export default function MentionsLegales() {
  return (
    <LegalPageShell title="MENTIONS LÉGALES" subtitle="Informations légales concernant Visit Makkah">
      <LegalSection title="1. Éditeur du site">
        <p>Le site {COMPANY.siteHost} est édité par :</p>
        <ul className="list-none space-y-1 ml-0">
          <li>
            <strong>Nom commercial :</strong> {COMPANY.tradeName}
          </li>
          <li>
            <strong>Raison sociale :</strong> {COMPANY.legalName}
          </li>
          <li>
            <strong>Forme juridique :</strong> {COMPANY.legalForm}
          </li>
          <li>
            <strong>Company number :</strong> {COMPANY.companyNumber}
          </li>
          <li>
            <strong>Immatriculation :</strong> {COMPANY.registry} —{' '}
            <a
              href={COMPANY.registryUrl}
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              fiche publique
            </a>
          </li>
          <li>
            <strong>Date d’immatriculation :</strong> {COMPANY.incorporatedOn}
          </li>
          <li>
            <strong>Siège social (registered office) :</strong> {COMPANY.registeredOffice}
          </li>
          <li>
            <strong>Activité :</strong> {COMPANY.activity}
          </li>
          <li>
            <strong>Email :</strong>{' '}
            <a href={`mailto:${COMPANY.email}`} className="text-primary underline">
              {COMPANY.email}
            </a>
          </li>
          <li>
            <strong>Téléphone / WhatsApp :</strong>{' '}
            <a href={`tel:${COMPANY.phoneTel}`} className="text-primary underline">
              {COMPANY.phoneDisplay}
            </a>
          </li>
        </ul>
        <p>
          La société n’est pas un opérateur de voyages immatriculé en France (pas de numéro Atout
          France — IM). Elle ne propose pas l’organisation de voyages au départ de la France : les
          prestations concernent l’accompagnement et les services sur place, à l’arrivée en Arabie
          saoudite.
        </p>
      </LegalSection>

      <LegalSection title="2. Directeur de la publication">
        <p>Le directeur de la publication est {COMPANY.publicationDirector}.</p>
      </LegalSection>

      <LegalSection title="3. Hébergement">
        <p>
          {COMPANY.host.name} — {COMPANY.host.address} —{' '}
          <a
            href={COMPANY.host.url}
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {COMPANY.host.url}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="4. Propriété intellectuelle">
        <p>
          L’ensemble du contenu du site est protégé. Toute reproduction non autorisée est interdite
          sans accord écrit de {COMPANY.legalName}.
        </p>
      </LegalSection>

      <LegalSection title="5. Données personnelles">
        <p>
          Les traitements sont décrits dans la{' '}
          <LegalLink href={LEGAL_PATHS.privacy}>politique de confidentialité</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies">
        <p>
          Cookies nécessaires au fonctionnement uniquement, sauf consentement pour d’éventuels cookies
          optionnels. Détail : <LegalLink href={LEGAL_PATHS.cookies}>politique cookies</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="7. Conditions de vente">
        <p>
          Les prestations proposées sur le site sont régies par les{' '}
          <LegalLink href={LEGAL_PATHS.cgv}>conditions générales de vente</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="8. Droit applicable">
        <p>
          Le site et le contrat sont régis par le droit anglais, sous réserve des dispositions
          impératives applicables aux consommateurs dans leur pays de résidence (notamment dans
          l’Union européenne).
        </p>
      </LegalSection>

      <LegalUpdated />
    </LegalPageShell>
  )
}
