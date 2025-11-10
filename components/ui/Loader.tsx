"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  size?: number
  label?: string
}

export default function Loader({ className, size = 28, label }: Props) {
  const style: React.CSSProperties = { width: size, height: size, borderWidth: Math.max(2, Math.floor(size / 8)) }
  return (
    <div className={cn('w-full flex flex-col items-center justify-center py-10', className)}>
      <div
        className="animate-spin rounded-full border-t-transparent border-primary"
        style={style}
        aria-label={label || 'Chargement'}
      />
      {label ? <p className="mt-3 text-sm text-gray-500">{label}</p> : null}
    </div>
  )
}
