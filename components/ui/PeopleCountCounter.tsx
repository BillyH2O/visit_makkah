"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type PeopleCountCounterProps = {
  value?: number
  onValueChange: (value: number) => void
  className?: string
  triggerClassName?: string
  placeholder?: string
  min?: number
  max?: number
}

export default function PeopleCountCounter({ 
  value, 
  onValueChange, 
  className,
  triggerClassName,
  placeholder = 'Nombre de personnes...',
  min = 1,
  max = 10
}: PeopleCountCounterProps) {
  const currentValue = value ?? 0
  const hasValue = value !== undefined && value > 0
  const displayValue = hasValue ? currentValue : undefined

  const handleDecrement = () => {
    if (hasValue && currentValue > min) {
      onValueChange(currentValue - 1)
    } else if (!hasValue) {
      // Si pas de valeur, initialiser à min
      onValueChange(min)
    }
  }

  const handleIncrement = () => {
    if (!hasValue) {
      // Si pas de valeur, initialiser à min
      onValueChange(min)
    } else if (currentValue < max) {
      onValueChange(currentValue + 1)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        triggerClassName || "w-fit min-w-[200px] max-w-[200px]"
      )}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={hasValue && currentValue <= min}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-sm border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            hasValue && currentValue <= min && "opacity-30"
          )}
          aria-label="Diminuer"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <span className={cn(
          "flex-1 text-center font-medium",
          !displayValue && "text-muted-foreground"
        )}>
          {displayValue || placeholder}
        </span>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={hasValue && currentValue >= max}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-sm border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            hasValue && currentValue >= max && "opacity-30"
          )}
          aria-label="Augmenter"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
