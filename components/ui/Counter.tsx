"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

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
  max = 1000
}: CounterProps) {
  const [inputValue, setInputValue] = useState<string>(value.toString())

  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1)
    onValueChange(newValue)
    setInputValue(newValue.toString())
  }

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1)
    onValueChange(newValue)
    setInputValue(newValue.toString())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    
    // Permettre la saisie vide temporairement
    if (inputVal === '') {
      setInputValue('')
      return
    }

    // Ne permettre que les nombres
    if (!/^\d+$/.test(inputVal)) {
      return
    }

    const numValue = parseInt(inputVal, 10)
    
    // Vérifier les limites
    if (numValue >= min && numValue <= max) {
      setInputValue(inputVal)
      onValueChange(numValue)
    } else if (numValue < min) {
      setInputValue(min.toString())
      onValueChange(min)
    } else if (numValue > max) {
      setInputValue(max.toString())
      onValueChange(max)
    }
  }

  const handleInputBlur = () => {
    // Si l'input est vide ou invalide, remettre la valeur minimale
    if (inputValue === '' || parseInt(inputValue, 10) < min) {
      setInputValue(min.toString())
      onValueChange(min)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        triggerClassName || "w-fit"
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
        
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="min-w-[3ch] max-w-[6ch] text-center font-medium px-1 bg-transparent border-none outline-none focus:outline-none"
          style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
          inputMode="numeric"
        />
        
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
