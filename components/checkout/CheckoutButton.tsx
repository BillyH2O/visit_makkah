"use client"

import { cn } from '@/lib/utils'
import { useCheckout } from '@/hooks/useCheckout'
import Button from '@/components/ui/MainButton'

type Props = {
  productId: string
  quantity?: number
  peopleCount?: number
  className?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'neutral'
}

export default function CheckoutButton({ productId, quantity = 1, peopleCount, className, label = 'Réserver', size = 'sm', variant = 'secondary' }: Props) {
  const { startCheckout, loading } = useCheckout()

  return (
    <Button
      label={loading ? '...' : label}
      size={size}
      variant={variant}
      blur={true}
      className={cn('relative z-10 cursor-pointer', className)}
      onClick={() => {
        console.debug('[CheckoutButton] click', { productId, quantity, peopleCount })
        startCheckout(productId, { quantity, peopleCount })
      }}
    />
  )
}
