"use client"

import { cn } from '@/lib/utils'
import { useCheckout } from '@/hooks/useCheckout'
import Button from '@/components/ui/MainButton'

type Props = {
  productId: string
  quantity?: number
  className?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'neutral'
}

export default function CheckoutButton({ productId, quantity = 1, className, label = 'Réserver', size = 'sm', variant = 'secondary' }: Props) {
  const { startCheckout, loading } = useCheckout()

  return (
    <Button
      label={loading ? 'Redirection...' : label}
      size={size}
      variant={variant}
      blur={true}
      className={cn('relative z-10 cursor-pointer', className)}
      onClick={() => {
        console.debug('[CheckoutButton] click', { productId, quantity })
        startCheckout(productId, { quantity })
      }}
    />
  )
}
