"use client"

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'neutral' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

interface MainButtonProps {
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  blur?: boolean
  href?: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
  disabled?: boolean
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
  disabled = false,
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
    disabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : '',
    className
  )

  const content = children || label

  if (href) {
    if (disabled) {
      return (
        <span aria-disabled="true" className={buttonClasses}>
          {content}
        </span>
      )
    } else {
      // Handle anchor links with smooth scroll
      if (href.startsWith('#')) {
        return (
          <a
            href={href}
            className={buttonClasses}
            onClick={(e) => {
              e.preventDefault()
              const targetId = href.slice(1)
              const element = document.getElementById(targetId)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              if (onClick) onClick()
            }}
          >
            {content}
          </a>
        )
      }
    return (
        <Link href={href} className={buttonClasses} scroll={true}>
        {content}
      </Link>
    )
    }
  }

  return (
    <button onClick={onClick} className={buttonClasses} disabled={disabled}>
      {content}
    </button>
  )
}

export default Button

