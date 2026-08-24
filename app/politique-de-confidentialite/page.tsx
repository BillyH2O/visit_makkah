import type { Metadata } from 'next'
import { COMPANY, LEGAL_PATHS } from '@/lib/legal/company'
import { LegalLink, LegalPageShell, LegalSection, LegalUpdated } from '@/components/legal/LegalPageShell'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de Visit Makkah : données, visas, Stripe, droits RGPD.',
  alternates: { canonical: LEGAL_PATHS.privacy },
}

export default function PolitiqueConfidentialite() {
  return (
    <LegalPageShell
      title="POLITIQUE DE CONFIDENTIALITÉ"
      subtitle={`Dernière mise à jour : ${COMPANY.lastUpdated}`}
    >
      <LegalSection title="1. Responsable du traitement">
        <p>
          {COMPANY.legalName} (company number {COMPANY.companyNumber}), {COMPANY.registeredOffice} —{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-primary underline">
            {COMPANY.email}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <ul className="list-disc list-inside space-y-2">
          <li>Identité et coordonnées (nom, e-mail, téléphone, adresse)</li>
          <li>
            Données de commande / réservation et paiement (via Stripe ; pas de numéro de carte stocké
            chez nous)
          </li>
          <li>
            Documents transmis pour un visa (passeport, titre de séjour, photos) — données
            d’identification, parfois biométriques au sens large, traitées uniquement pour la
            formalité demandée
          </li>
          <li>Messages de contact, WhatsApp, e-mail</li>
          <li>Données techniques (IP, logs) et cookies nécessaires</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalités et bases légales">
        <ul className="list-disc list-inside space-y-2">
          <li>
            Exécution du contrat : services à l’arrivée en Arabie saoudite (accompagnement, transport
            local, visites, assistance), sadaqa, traitement de visa
          </li>
          <li>Obligation légale : facturation et obligations comptables</li>
          <li>Intérêt légitime : sécurité, prévention de la fraude, réponse aux messages</li>
          <li>Consentement : cookies optionnels et communications marketing</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Durées">
        <ul className="list-disc list-inside space-y-2">
          <li>Commandes / factures : 10 ans</li>
          <li>Dossiers visa : le temps du traitement puis 2 ans, sauf obligation plus longue</li>
          <li>Contact : 3 ans après le dernier échange</li>
          <li>Logs : 12 mois — choix cookies : 6 mois</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Destinataires et transferts">
        <p>
          Destinataires : équipe Visit Makkah, Vercel (hébergement), Stripe (paiement), prestataires
          e-mail, autorités saoudiennes et prestataires locaux nécessaires au visa, au transport ou
          à l’accompagnement sur place.
        </p>
        <p>
          Le Royaume-Uni bénéficie d’une décision d’adéquation de la Commission européenne. Le
          transfert de documents d’identité vers l’Arabie saoudite est nécessaire à l’exécution de
          la prestation de visa. Il repose sur l’article 49.1.b du RGPD (exécution du contrat) et,
          lorsque c’est possible, sur des garanties contractuelles. Stripe et Vercel peuvent traiter
          des données aux États-Unis (clauses types / Data Privacy Framework).
        </p>
      </LegalSection>

      <LegalSection title="6. Vos droits">
        <p>
          Accès, rectification, effacement, limitation, opposition, portabilité : {COMPANY.email}.
          Réclamation : CNIL (www.cnil.fr) pour les personnes concernées dans l’UE ; Information
          Commissioner’s Office (ICO, www.ico.org.uk) s’agissant du responsable établi au
          Royaume-Uni.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          Voir la <LegalLink href={LEGAL_PATHS.cookies}>politique cookies</LegalLink>.
        </p>
      </LegalSection>

      <LegalUpdated />
    </LegalPageShell>
  )
}
