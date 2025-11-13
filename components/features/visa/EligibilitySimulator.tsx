"use client"

import { useMemo, useState } from 'react'

type Nationality =
  | 'France'
  | 'Schengen (autre)'
  | 'USA'
  | 'UK'
  | 'Algérie'
  | 'Maroc'
  | 'Tunisie'
  | 'Autre'

type Eligibility = {
  eligible: boolean
  label: string
  note?: string
}

export default function EligibilitySimulator({ id }: { id: string }) {
  const [nationality, setNationality] = useState<Nationality>('France')
  const [age, setAge] = useState<number>(30)
  const [isMuslim, setIsMuslim] = useState<boolean>(true)
  const [hasResidentPermit, setHasResidentPermit] = useState<boolean>(false)
  const [hasValidVisaUsed, setHasValidVisaUsed] = useState<boolean>(false)

  const result = useMemo(() => {
    const omra: Eligibility = {
      eligible: isMuslim,
      label: isMuslim ? 'Éligible' : 'Non éligible',
      note: "Visa Omra généralement réservé aux voyageurs musulmans.",
    }

    const isAlgMar = nationality === 'Algérie' || nationality === 'Maroc'
    const isTun = nationality === 'Tunisie'
    const foreignersCond = age < 60 && (hasResidentPermit || hasValidVisaUsed)

    const foreigners: Eligibility = isTun
      ? { eligible: false, label: 'Non éligible', note: "Tunisie: difficultés actuelles pour l'e‑Visa." }
      : {
          eligible: isAlgMar && foreignersCond,
          label: isAlgMar && foreignersCond ? 'Éligible' : 'Non éligible',
          note:
            "Algérie/Maroc, < 60 ans, et soit titre de séjour USA/UK/UE, soit visa USA/UK ≥ 3 mois déjà utilisé. (Le visa Schengen n'est plus accepté)",
        }

    const isSchengenNat = nationality === 'France' || nationality === 'Schengen (autre)'
    const isUSorUKNat = nationality === 'USA' || nationality === 'UK'
    const tourist: Eligibility = {
      eligible: isSchengenNat || isUSorUKNat,
      label: isSchengenNat || isUSorUKNat ? 'Éligible' : 'Non éligible',
      note: "Ressortissants Schengen, USA, Royaume‑Uni. Attention: détenir un visa Schengen ne suffit plus pour un e‑Visa touriste.",
    }

    return { omra, foreigners, tourist }
  }, [nationality, age, isMuslim, hasResidentPermit, hasValidVisaUsed])

  return (
    <div id={id} className="w-full max-w-4xl mx-auto border border-black/10 rounded-2xl p-6 bg-white/70 dark:bg-black/30">
      <h3 className="text-2xl font-semibold mb-4">Simulateur d’éligibilité</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm">Nationalité</label>
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value as Nationality)}
            className="h-11 rounded-xl border-2 border-black/20 bg-white/90 px-3 outline-none focus:border-primary"
          >
            {['France','Schengen (autre)','USA','UK','Algérie','Maroc','Tunisie','Autre'].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm">Âge</label>
          <input
            type="number"
            min={0}
            value={age}
            onChange={(e) => setAge(Number(e.target.value) || 0)}
            className="h-11 rounded-xl border-2 border-black/20 bg-white/90 px-3 outline-none focus:border-primary"
          />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isMuslim} onChange={(e) => setIsMuslim(e.target.checked)} />
          <span className="text-sm">Voyageur musulman</span>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={hasResidentPermit} onChange={(e) => setHasResidentPermit(e.target.checked)} />
          <span className="text-sm">Titre de séjour USA / UK / UE</span>
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" checked={hasValidVisaUsed} onChange={(e) => setHasValidVisaUsed(e.target.checked)} />
          <span className="text-sm">Visa USA / UK avec ≥ 3 mois restants et déjà utilisé (Schengen non accepté)</span>
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <EligibilityCard title="🌙 Visa Omra" status={result.omra} />
        <EligibilityCard title="🌍 Étrangers résidant Schengen/USA/UK" status={result.foreigners} />
        <EligibilityCard title="🕌 Visa Touriste (e‑Visa)" status={result.tourist} />
      </div>

      <p className="text-xs text-gray-500 mt-4">Ce simulateur est indicatif. Les exigences peuvent évoluer selon l’administration saoudienne.</p>
    </div>
  )
}

function EligibilityCard({ title, status }: { title: string; status: Eligibility }) {
  return (
    <div className="rounded-xl border border-black/10 p-4 bg-white/60 dark:bg-black/30">
      <h4 className="font-medium mb-2">{title}</h4>
      <span
        className={`inline-block text-xs px-2 py-1 rounded-full ${
          status.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {status.label}
      </span>
    </div>
  )
}
