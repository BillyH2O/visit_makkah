"use client"

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'neutral' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

interface MainButtonProps {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  blur?: boolean
  href?: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  blur = false,
  href,
  onClick,
  className,
  children,
}: MainButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 hover:scale-100 hover:shadow-lg focus:outline-none'
  
  const variantStyles = {
    primary: blur
      ? 'bg-primary backdrop-blur-md text-white border border-primary/30 hover:bg-primary/80 hover:border-primary/50'
      : 'bg-primary/70 text-white border border-primary/50 hover:bg-primary hover:border-primary',
    neutral: blur
      ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 hover:border-white/50'
      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30',
    secondary: blur
      ? 'bg-secondary backdrop-blur-md text-white border border-secondary/30 hover:bg-secondary/80 hover:border-secondary/50'
      : 'bg-secondary text-white border border-secondary/50 hover:bg-secondary/90 hover:border-secondary',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const buttonClasses = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  )

  const content = children || label

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {content}
    </button>
  )
}

export default Button

