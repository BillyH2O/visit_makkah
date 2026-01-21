"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { Calendar } from "@/components/ui/calendar-rac"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { parseDate, today, getLocalTimeZone, CalendarDate, DateValue } from "@internationalized/date"

type DatePickerProps = {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  disabledDates?: Date[]
  availableDates?: Date[]
  unavailableDates?: Date[]
  className?: string
  placeholder?: string
}

// Convert Date to CalendarDate
function dateToCalendarDate(date: Date): CalendarDate {
  return parseDate(date.toISOString().split('T')[0])
}

// Convert CalendarDate to Date
function calendarDateToDate(calendarDate: CalendarDate): Date {
  return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day)
}

export function DatePicker({
  date,
  onSelect,
  disabledDates = [],
  availableDates = [],
  unavailableDates = [],
  className,
  placeholder = "Sélectionner une date",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Convert Date to CalendarDate for react-aria-components
  const selectedDate = React.useMemo(() => {
    return date ? dateToCalendarDate(date) : undefined
  }, [date])

  // Disable past dates
  const todayDate = today(getLocalTimeZone())

  // Helper function to normalize date to YYYY-MM-DD string (ignoring timezone)
  const normalizeDateString = (d: Date): string => {
    // Use UTC methods to avoid timezone issues
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Function to check if a date should be unavailable
  const isDateUnavailable = (date: DateValue): boolean => {
    // Convert DateValue to CalendarDate if needed
    const calendarDate = date instanceof CalendarDate ? date : new CalendarDate(date.year, date.month, date.day)
    
    // Disable past dates
    if (calendarDate.compare(todayDate) < 0) {
      return true
    }
    
    // Create a normalized date string from the calendar date (YYYY-MM-DD)
    const dateStr = `${calendarDate.year}-${String(calendarDate.month).padStart(2, '0')}-${String(calendarDate.day).padStart(2, '0')}`
    
    // Check if date is in unavailableDates
    if (unavailableDates.some(d => normalizeDateString(d) === dateStr)) {
      return true
    }
    
    // If availableDates is provided, only allow those dates
    if (availableDates.length > 0) {
      const isAvailable = availableDates.some(d => normalizeDateString(d) === dateStr)
      return !isAvailable
    }
    
    // Check if in disabledDates
    if (disabledDates.some(d => normalizeDateString(d) === dateStr)) {
      return true
    }
    
    return false
  }

  const handleSelect = (value: DateValue | null) => {
    if (value) {
      // Convert DateValue (which can be CalendarDate or CalendarDateTime) to CalendarDate
      const calendarDate = value instanceof CalendarDate ? value : new CalendarDate(value.year, value.month, value.day)
      const dateObj = calendarDateToDate(calendarDate)
      onSelect?.(dateObj)
      setOpen(false)
    } else {
      onSelect?.(undefined)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: fr }) : <span>{placeholder}</span>}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          value={selectedDate}
          onChange={handleSelect}
          isDateUnavailable={isDateUnavailable}
          minValue={todayDate}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  )
}
