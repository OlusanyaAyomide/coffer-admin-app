 
 

import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';

type CustomProps = {
  CancelDate: () => void;
  onOk: () => void;
};

export type CalendarProps = React.ComponentProps<typeof DayPicker> & CustomProps;

function RangeCalendar({
  className,
  classNames,
  showOutsideDays = true,
  CancelDate,
  onOk,
  ...props
}: CalendarProps) {
  return (
    <div
      className={cn(
        'relative w-fit overflow-hidden rounded-lg',
        'border border-border bg-card shadow-sm',
        'px-1 sm:px-2'
      )}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn('p-3', className)}
        classNames={{
          months:
            'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-0',
          caption:
            'relative flex items-center justify-center pt-1 mt-2 mb-5',
          caption_label: 'text-sm font-medium text-foreground',
          nav: 'flex items-center space-x-1',
          nav_button: cn(
            buttonVariants({ variant: 'outline' }),
            'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100'
          ),
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',

          table: 'w-full border-collapse space-y-1',
          head_row: 'flex',
          head_cell:
            'w-9 sm:w-10 rounded-md text-[0.8rem] font-normal text-muted-foreground',
          row: 'flex w-full mt-2',
          cell: cn(
            'relative h-9 w-9 sm:h-10 sm:w-10 p-0 text-center text-sm',
            'rounded-full',
            '[&:has([aria-selected])]:bg-accent',
            'focus-within:z-20'
          ),
          day: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full font-normal',
            'aria-selected:opacity-100'
          ),

          /* Selected & ranges */
          day_selected:
            'bg-primary text-primary-foreground hover:bg-primary focus:bg-primary',
          day_range_middle:
            'aria-selected:bg-accent aria-selected:text-accent-foreground',
          day_range_end: 'day-range-end',

          /* States */
          day_today:
            'border border-primary text-primary font-medium',
          day_outside:
            'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
          day_disabled: 'text-muted-foreground opacity-50',
          day_hidden: 'invisible',

          ...classNames,
        }}
        {...props}
      />

      {/* Actions */}
      <div className="mb-4 flex items-center justify-center gap-2 px-4">
        <Button
          variant="ghost"
          onClick={CancelDate}
          className="h-8 rounded-full px-3 text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>

        <Button
          onClick={onOk}
          size="icon"
          className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Ok
        </Button>
      </div>
    </div>
  );
}

RangeCalendar.displayName = 'RangeCalendar';

export default RangeCalendar;
