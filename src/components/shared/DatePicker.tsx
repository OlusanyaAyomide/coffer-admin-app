'use client'

import { useState } from 'react';

import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';
import useWindowProperties from '@/hooks/useWindowProperty';
import { formatDate, formatTimeToNoon } from '@/services/TimeServices';

;


type DatePickerType = {
  placeHolderText: string;
  onDateSelect: (date: string) => void;

  selectedDate?: Date | string;
  showYear?: boolean;
  showPlaceholder?: boolean;
  disabled?: boolean;

  error?: string;
  className?: string;
  errorClassName?: string;

  datePickerSide?: 'left' | 'top' | 'right' | 'bottom';
};

function ModifiedCaledar({
  selectedDate,
  onDateSelect,
  closePicker,
}: {
  selectedDate: Date | string | undefined;
  onDateSelect: (date: string | undefined) => void;
  closePicker: () => void;
}) {

  const [date, setDate] = useState<Date | undefined>(
    new Date(typeof selectedDate === 'string' ? selectedDate : selectedDate || new Date())
  )

  return (
    <div className="flex flex-col gap-4">
      <Calendar
        mode="single"
        defaultMonth={date}
        selected={date}
        onSelect={(date) => {
          setDate(date)
        }}
        captionLayout={"dropdown"}
        className="rounded-lg border shadow-sm"
      >
        <div className='flex justify-end gap-4 pt-4'>
          <Button
            size={"sm"}
            onClick={() => {
              closePicker()
            }}
            className='w-fit px-4 h-7' variant={'outline'}>Cancel</Button>
          <Button
            size={"sm"}
            onClick={() => {
              if (date) {
                onDateSelect(date.toISOString())
              }
            }}
            className='w-fit px-4 h-7' >Select</Button>
        </div>
      </Calendar>
    </div>
  )
}

export default function DatePicker({
  placeHolderText,
  onDateSelect,
  selectedDate,
  showYear,
  showPlaceholder,
  disabled,
  error,
  className,
  errorClassName,
  datePickerSide,
}: DatePickerType) {
  const [isFocused, setIsFocused] = useState(false);

  const { isTab, isDesktop } = useWindowProperties({});
  const isLargeScreen = isTab || isDesktop;


  const triggerClasses = () => {
    if (isFocused) {
      return 'ring-primary ring';
    }
    if (error) {
      return 'border border-destructive';
    }
    return 'border border-border';
  };

  const labelClasses = () => {
    if (isFocused || selectedDate) {
      return 'bg-background text-foreground -translate-y-[27px] text-sm font-normal';
    }
    return 'text-muted-foreground';
  };

  return (
    <div className={cn('w-full mb-5 relative', className)}>
      <Popover open={isFocused} onOpenChange={setIsFocused}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            'relative flex items-center justify-between',
            'w-full h-10 sm:h-12 px-4 py-1 rounded-3xl',
            'bg-background text-foreground',
            'transition-colors',
            disabled && 'cursor-not-allowed opacity-50',
            triggerClasses()
          )}
        >
          {/* Floating label */}
          {(selectedDate || !showPlaceholder) && (
            <span
              className={cn(
                'px-1 font-light transition-all duration-300',
                labelClasses()
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
                placeHolderText
              )}
            </h3>
          ) : (
            <span
              className={cn(
                'font-light text-muted-foreground',
                !showPlaceholder && 'hidden'
              )}
            >
              {placeHolderText}
            </span>
          )}

          <CalendarIcon
            className="mr-4 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent
          side={isLargeScreen ? datePickerSide : 'bottom'}
          align="start"
          className="p-0 w-fit bg-card border border-border shadow-md"
        >
          <ModifiedCaledar
            selectedDate={selectedDate}
            // ={selectedDate}
            closePicker={() => setIsFocused(false)}
            onDateSelect={(date) => {
              console.log(date)
              if (!date) return;
              const formatted = formatTimeToNoon(new Date(date));
              setIsFocused(false);
              onDateSelect(formatted);
            }}
          />
        </PopoverContent>
      </Popover>

      {error && (
        <span
          className={cn(
            'text-destructive text-sm absolute -bottom-5 left-2',
            errorClassName
          )}
        >
          {error}
        </span>
      )}
    </div>
  );
}


