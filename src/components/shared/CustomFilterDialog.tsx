
import { useState, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
// import DateRangePicker from '@/shared/global/DateRangePicker';


type CustomDialogType = {
  children: ReactNode
  disabled?: boolean
  onDateSelect: (range: DateRange | undefined) => void
};

export default function CustomFilterDialog(
  { children, disabled, onDateSelect }: CustomDialogType,

) {

  const [open, setOpen] = useState<boolean>(false);

  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const handleOpenChange = (status: boolean) => {
    if (disabled && status) {
      return;
    }
    setOpen(status);
  };
  return (
    <div>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <div>
            {children}
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="top-[50%] max-w-[625px] bg-transparent border-0 p-1 py-0">
          <AlertDialogCancel className="rounded-full bg-white dark:bg-black border-none h-12 w-12 absolute -top-16 md:-top-12 right-2 md:-right-12 lg:h-12"><X className="h-5 w-5 scale-125" /></AlertDialogCancel>
          <AlertDialogTitle className="hidden">Filter by Date Range</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground hidden" />
          <div className="font-medium py-4 relative">
            <Calendar
              className=""
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              required
              // CancelDate={() => {
              //   setDate(undefined);
              //   setOpen(false);
              // }}
              onSelect={(range) => {
                setDate(range);
              }}
              // onOk={() => {
              //   if (date?.from && date.to) {
              //     onDateSelect(date);
              //     setOpen(false);
              //     setDate(undefined);
              //   }
              // }}
              numberOfMonths={2}
            >
              <div className='flex justify-end gap-4 pt-4'>
                <Button
                  onClick={() => {
                    setOpen(false);
                    setDate(undefined);
                  }}
                  className='w-fit px-4 h-7' variant={'outline'}>Cancel</Button>
                <Button

                  onClick={() => {
                    if (date) {
                      onDateSelect(date);
                      setOpen(false);
                      setDate(undefined);

                    }
                  }}
                  className='w-fit px-4 h-7' >Select</Button>
              </div>
            </Calendar>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
