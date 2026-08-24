"use client"

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useCheckout } from '@/hooks/useCheckout'
import Button from '@/components/ui/MainButton'
import { LEGAL_PATHS } from '@/lib/legal/company'

type Props = {
  productId: string
  quantity?: number
  peopleCount?: number
  reservationDate?: Date
  className?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'neutral'
  disabled?: boolean
}

export default function CheckoutButton({ productId, quantity = 1, peopleCount, reservationDate, className, label = 'Réserver', size = 'sm', variant = 'secondary', disabled }: Props) {
  const { startCheckout, loading } = useCheckout()
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="space-y-2">
      <label className="flex items-start gap-2 text-[11px] leading-snug text-black/70 dark:text-white/70 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span>
          J&apos;accepte les{' '}
          <Link href={LEGAL_PATHS.cgv} target="_blank" className="underline text-primary">
            CGV
          </Link>
        </span>
      </label>
      <Button
        label={loading ? '...' : label}
        size={size}
        variant={variant}
        blur={true}
        className={cn('relative z-10 cursor-pointer', className)}
        disabled={disabled || loading || !accepted}
        onClick={() => {
          if (disabled || !accepted) return
          startCheckout(productId, { quantity, peopleCount: peopleCount || 1, reservationDate: reservationDate?.toISOString() })
        }}
      />
    </div>
  )
}
