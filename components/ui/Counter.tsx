"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type CounterProps = {
  value: number
  onValueChange: (value: number) => void
  className?: string
  triggerClassName?: string
  min?: number
  max?: number
}

export default function Counter({ 
  value, 
  onValueChange, 
  className,
  triggerClassName,
  min = 1,
  max = 10
}: CounterProps) {
  const handleDecrement = () => {
    if (value > min) {
      onValueChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onValueChange(value + 1)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        triggerClassName || "w-auto"
      )}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-sm border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            value <= min && "opacity-30"
          )}
          aria-label="Diminuer"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <span className="min-w-[2ch] text-center font-medium px-2">
          {value}
        </span>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-sm border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            value >= max && "opacity-30"
          )}
          aria-label="Augmenter"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
