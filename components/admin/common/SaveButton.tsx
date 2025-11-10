"use client"

import { cn } from '@/lib/utils'

type Props = {
  saving?: boolean
  label?: string
  className?: string
  expand?: boolean
}

export default function SaveButton({ saving, label = 'Enregistrer', className, expand }: Props) {
  return (
    <button
      type="submit"
      disabled={saving}
      className={cn(
        'px-4 py-2 rounded-lg bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50',
        expand ? 'flex-1' : undefined,
        className,
      )}
    >
      {saving ? 'Enregistrement...' : label}
    </button>
  )
}
