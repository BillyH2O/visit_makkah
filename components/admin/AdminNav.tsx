"use client"

type AdminSection = 'offres' | 'faq' | 'gallery' | 'settings'

type Props = {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
}

export default function AdminNav({ activeSection, onSectionChange }: Props) {
  const sections: { id: AdminSection; label: string }[] = [
    { id: 'offres', label: 'Offres' },
    { id: 'faq', label: 'FAQ' },
    { id: 'gallery', label: 'Galerie' },
    { id: 'settings', label: 'Paramètres' },
  ]

  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === section.id
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {section.label}
        </button>
      ))}
    </div>
  )
}

