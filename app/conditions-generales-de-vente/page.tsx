import type { Metadata } from 'next'
import { COMPANY, LEGAL_PATHS } from '@/lib/legal/company'
import { LegalLink, LegalPageShell, LegalSection, LegalUpdated } from '@/components/legal/LegalPageShell'

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description:
    'CGV Visit Makkah : services à l’arrivée en Arabie saoudite, paiement, visas, annulation.',
  alternates: { canonical: LEGAL_PATHS.cgv },
}

export default function CgvPage() {
  return (
    <LegalPageShell
      title="CONDITIONS GÉNÉRALES DE VENTE"
      subtitle={`Dernière mise à jour : ${COMPANY.lastUpdated}`}
    >
      <LegalSection title="1. Objet">
        <p>
          Les présentes CGV régissent les prestations proposées sur {COMPANY.siteHost} par{' '}
          {COMPANY.legalName} : accompagnement et services à l’arrivée en Arabie saoudite
          (transport local, visites, assistance sur place), demandes de visa et sadaqa.
        </p>
        <p>
          {COMPANY.legalName} n’organise pas de voyages au départ de la France et n’est pas un
          opérateur de voyages immatriculé Atout France. Le client réserve et assume son transport
          international (vols, etc.) par ses propres moyens. Les prestations Visit Makkah
          commencent à l’arrivée dans le pays.
        </p>
        <p>Toute commande implique l’acceptation des présentes CGV.</p>
      </LegalSection>

      <LegalSection title="2. Prestataire">
        <p>
          {COMPANY.legalName} — company number {COMPANY.companyNumber} — {COMPANY.registeredOffice}{' '}
          — {COMPANY.email} — {COMPANY.phoneDisplay}.
        </p>
      </LegalSection>

      <LegalSection title="3. Commande et paiement">
        <p>
          Les prix sont indiqués en euros TTC. Le paiement s’effectue en ligne via Stripe. La
          commande n’est ferme qu’après confirmation du paiement et, le cas échéant, validation des
          documents de visa.
        </p>
      </LegalSection>

      <LegalSection title="4. Visas et documents">
        <p>
          Visit Makkah transmet les dossiers aux autorités compétentes mais ne garantit pas
          l’obtention d’un visa, qui relève de la décision souveraine de l’Arabie saoudite. Un
          refus d’autorité n’ouvre pas automatiquement droit à remboursement des frais déjà engagés
          auprès des tiers, hors dispositions impératives.
        </p>
      </LegalSection>

      <LegalSection title="5. Dates, modification, annulation">
        <p>
          Les prestations sur place sont liées à des dates. Toute modification est soumise à
          disponibilité et peut entraîner des frais. Sauf mention plus favorable lors de la
          commande, une annulation à moins de 14 jours du début de la prestation peut entraîner la
          conservation de tout ou partie des sommes versées, correspondant aux frais déjà engagés.
        </p>
      </LegalSection>

      <LegalSection title="6. Droit de rétractation">
        <p>
          Les services d’hébergement, de transport, de restauration ou de loisirs fournis à une
          date ou selon une périodicité déterminée sont en principe exclus du droit de rétractation
          (droit de la consommation de l’UE / du Royaume-Uni). Les règles d’annulation du § 5
          s’appliquent alors. Les consommateurs établis dans l’UE conservent le bénéfice des
          dispositions impératives de leur pays de résidence.
        </p>
      </LegalSection>

      <LegalSection title="7. Responsabilité">
        <p>
          Visit Makkah s’engage à une obligation de moyens pour l’accompagnement et les services à
          l’arrivée. Elle n’est pas responsable de l’organisation du voyage au départ du pays du
          client, des faits des autorités, des retards aériens, des cas de force majeure ou d’un
          manquement du pèlerin aux règles locales.
        </p>
      </LegalSection>

      <LegalSection title="8. Données personnelles">
        <p>
          Voir la <LegalLink href={LEGAL_PATHS.privacy}>politique de confidentialité</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="9. Réclamations et litiges">
        <p>
          Réclamation préalable : {COMPANY.email}. Le consommateur de l’Union européenne peut saisir
          la plateforme RLL :{' '}
          <a
            href="https://ec.europa.eu/consumers/odr"
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          .
        </p>
        <p>
          Droit anglais, sous réserve des droits impératifs du consommateur dans son pays de
          résidence.
        </p>
      </LegalSection>

      <LegalUpdated />
    </LegalPageShell>
  )
}
