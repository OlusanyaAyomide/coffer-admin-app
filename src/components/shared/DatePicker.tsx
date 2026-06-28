'use client'

import { useState } from 'react'

import { CalendarIcon } from 'lucide-react'
import { Calendar } from '../ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { cn } from '@/lib/utils'
import useWindowProperties from '@/hooks/useWindowProperty'
import { formatDate, formatTimeToNoon } from '@/services/TimeServices'

type DatePickerType = {
  placeHolderText: string
  onDateSelect: (date: string) => void

  selectedDate?: Date | string
  minDate?: Date | string
  maxDate?: Date | string
  showYear?: boolean
  showPlaceholder?: boolean
  disabled?: boolean

  error?: string
  className?: string
  errorClassName?: string

  datePickerSide?: 'left' | 'top' | 'right' | 'bottom'
}

function ModifiedCaledar({
  selectedDate,
  minDate,
  maxDate,
  onDateSelect,
}: {
  selectedDate: Date | string | undefined
  minDate: Date | string | undefined
  maxDate: Date | string | undefined
  onDateSelect: (date: string | undefined) => void
}) {
  const [date, setDate] = useState<Date | undefined>(
    new Date(
      typeof selectedDate === 'string'
        ? selectedDate
        : selectedDate || new Date(),
    ),
  )
  const minimumDate = minDate ? new Date(minDate) : undefined
  const maximumDate = maxDate ? new Date(maxDate) : undefined

  return (
    <div className="flex flex-col gap-4">
      <Calendar
        mode="single"
        defaultMonth={date}
        selected={date}
        disabled={[
          ...(minimumDate && !Number.isNaN(minimumDate.getTime())
            ? [{ before: minimumDate }]
            : []),
          ...(maximumDate && !Number.isNaN(maximumDate.getTime())
            ? [{ after: maximumDate }]
            : []),
        ]}
        onSelect={(picked) => {
          setDate(picked)
          // Commit immediately on pick — no separate confirm step.
          if (picked) onDateSelect(picked.toISOString())
        }}
        captionLayout={'dropdown'}
        className="rounded-lg border shadow-sm"
      />
    </div>
  )
}

export default function DatePicker({
  placeHolderText,
  onDateSelect,
  selectedDate,
  minDate,
  maxDate,
  showYear,
  showPlaceholder,
  disabled,
  error,
  className,
  errorClassName,
  datePickerSide,
}: DatePickerType) {
  const [isFocused, setIsFocused] = useState(false)

  const { isTab, isDesktop } = useWindowProperties({})
  const isLargeScreen = isTab || isDesktop

  const triggerClasses = () => {
    if (isFocused) {
      return 'ring-primary ring'
    }
    if (error) {
      return 'border border-destructive'
    }
    return 'border border-border'
  }

  const labelClasses = () => {
    if (isFocused || selectedDate) {
      return 'bg-background text-foreground -translate-y-[27px] text-sm font-normal'
    }
    return 'text-muted-foreground'
  }

  return (
    <div className={cn('w-full mb-5 relative', className)}>
      <Popover open={isFocused} onOpenChange={setIsFocused}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            'relative flex items-center justify-between',
            'w-full h-10 px-4 py-1 rounded-md',
            'bg-background text-foreground',
            'transition-colors',
            disabled && 'cursor-not-allowed opacity-50',
            triggerClasses(),
          )}
        >
          {/* Floating label */}
          {(selectedDate || !showPlaceholder) && (
            <span
              className={cn(
                'px-1 font-light transition-all duration-300',
                labelClasses(),
              )}
            >
              {showPlaceholder ? ' ' : placeHolderText}
            </span>
          )}

          {/* Selected date */}
          {selectedDate ? (
            <h3 className="absolute left-[18px] top-3 font-light text-foreground">
              {formatDate(
                selectedDate,
                {
                  year: showYear ? 'numeric' : undefined,
                  month: '2-digit',
                  day: '2-digit',
                },
                placeHolderText,
              )}
            </h3>
          ) : (
            <span
              className={cn(
                'font-light text-muted-foreground',
                !showPlaceholder && 'hidden',
              )}
            >
              {placeHolderText}
            </span>
          )}

          <CalendarIcon className="mr-4 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent
          side={isLargeScreen ? datePickerSide : 'bottom'}
          align="start"
          className="p-0 w-fit bg-card border border-border shadow-md"
        >
          <ModifiedCaledar
            selectedDate={selectedDate}
            minDate={minDate}
            maxDate={maxDate}
            onDateSelect={(date) => {
              if (!date) return
              const formatted = formatTimeToNoon(new Date(date))
              setIsFocused(false)
              onDateSelect(formatted)
            }}
          />
        </PopoverContent>
      </Popover>

      {error && (
        <span
          className={cn(
            'text-destructive text-sm absolute -bottom-5 left-2',
            errorClassName,
          )}
        >
          {error}
        </span>
      )}
    </div>
  )
}
