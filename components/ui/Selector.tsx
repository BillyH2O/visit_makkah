"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SelectorProps = {
  value?: number
  onValueChange: (value: number) => void
  className?: string
  triggerClassName?: string
  placeholder?: string
  label?: string
  isSadaqa?: boolean
  isTransport?: boolean
}

export default function Selector({ 
  value, 
  onValueChange, 
  className,
  triggerClassName,
  placeholder = 'Nombre de personnes',
  label = 'Nombre de personnes au total',
  isSadaqa = false,
  isTransport = false
}: SelectorProps) {
  const isQuantity = isSadaqa || isTransport
  const unitText = isQuantity ? (isTransport ? 'véhicule' : 'quantité') : (value === 1 ? 'personne' : 'personnes')
  const itemText = (num: number) => {
    if (isSadaqa) return `${num}`
    if (isTransport) return `${num} ${num === 1 ? 'véhicule' : 'véhicules'}`
    return `${num} ${num === 1 ? 'personne' : 'personnes'}`
  }
  const defaultLabel = isQuantity ? (isTransport ? 'Nombre de véhicules' : 'Quantité') : 'Nombre de personnes au total'
  
  return (
    <div className={className}>
      <Select 
        value={value !== undefined ? String(value) : undefined} 
        onValueChange={(val) => onValueChange(Number(val))}
      >
        <SelectTrigger className={`w-fit h-9 focus:ring-0 focus:ring-offset-0 focus:border-input ${triggerClassName || ''}`}>
          {value !== undefined ? (
            <SelectValue>{isQuantity ? (isTransport ? `${value} ${value === 1 ? 'véhicule' : 'véhicules'}` : value) : `${value} ${unitText}`}</SelectValue>
          ) : (
            <span className="truncate text-left flex-1 text-muted-foreground">{placeholder}</span>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label || defaultLabel}</SelectLabel>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <SelectItem key={num} value={String(num)}>
                {itemText(num)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
