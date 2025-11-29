"use client"

import { cn } from '@/lib/utils'
import { useCheckout } from '@/hooks/useCheckout'
import Button from '@/components/ui/MainButton'

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

  return (
    <Button
      label={loading ? '...' : label}
      size={size}
      variant={variant}
      blur={true}
      className={cn('relative z-10 cursor-pointer', className)}
      disabled={disabled || loading}
      onClick={() => {
        if (disabled) return
        console.debug('[CheckoutButton] click', { productId, quantity, peopleCount, reservationDate })
        startCheckout(productId, { quantity, peopleCount: peopleCount || 1, reservationDate: reservationDate?.toISOString() })
      }}
    />
  )
}
