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

type PeopleCountSelectProps = {
  value?: number
  onValueChange: (value: number) => void
  className?: string
  triggerClassName?: string
}

export default function PeopleCountSelect({ 
  value, 
  onValueChange, 
  className,
  triggerClassName 
}: PeopleCountSelectProps) {
  return (
    <div className={className}>
      <Select 
        value={value !== undefined ? String(value) : undefined} 
        onValueChange={(val) => onValueChange(Number(val))}
      >
        <SelectTrigger className={`w-fit min-w-[200px] max-w-[200px] h-9 ${triggerClassName || ''}`}>
          {value !== undefined ? (
            <SelectValue>{value}</SelectValue>
          ) : (
            <span className="truncate text-left flex-1 text-muted-foreground">Nombre de personnes...</span>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Nombre de personnes au total</SelectLabel>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <SelectItem key={num} value={String(num)}>
                {num}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

