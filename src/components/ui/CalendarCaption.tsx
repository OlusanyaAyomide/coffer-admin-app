import { ArrowLeft, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  generateLast100Years,
  formatDate,
  changeCalendarYear,
  addOneMonth,
  subtractOneMonth,
} from '@/services/TimeServices';

type CalendarOptionType = {
  displayDate: Date;
  setIsOpened: React.Dispatch<React.SetStateAction<boolean>>;
  isMonthOpened: boolean;
  showYear: boolean;
  setDisplayDate: React.Dispatch<React.SetStateAction<Date>>;
};

export default function CalendarCaption({
  displayDate,
  setIsOpened,
  setDisplayDate,
  showYear,
  isMonthOpened,
}: CalendarOptionType) {
  const last100years = generateLast100Years();

  return (
    <div className="px-2 relative">
      {/* Title */}
      <h3 className="-ml-2 -mt-1 w-full text-base font-medium text-muted-foreground">
        Select Date
      </h3>

      <div className="mt-2">
        {/* Active date */}
        <h2 className="-ml-4 w-[calc(100%+32px)] border-b border-border pb-2 pl-2 text-3xl text-foreground">
          {formatDate(displayDate)}
        </h2>

        <div className="mt-0.5 flex items-center justify-between">
          {/* Month / Year dropdown */}
          {showYear && (
            <Button
              onClick={() => setIsOpened((prev) => !prev)}
              size="sm"
              variant="ghost"
              className="
                -ml-2 mt-1 flex h-7 items-center justify-start
                bg-transparent px-2 text-foreground
                hover:bg-accent hover:text-accent-foreground
              "
            >
              <span className="-ml-1">{formatDate(displayDate)}</span>
              <ChevronDown
                className={`
                  ml-2 transition-transform duration-300
                  ${isMonthOpened ? 'rotate-180' : ''}
                `}
              />
            </Button>
          )}

          {/* Month navigation */}
          <div
            className={`
              relative flex items-center justify-between
              rounded-md border border-border
              ${showYear ? 'w-[100px] pl-3' : 'w-full'}
            `}
          >
            {/* Previous month */}
            <button
              type="button"
              aria-label="previous month"
              onClick={() => {
                const previousMonth = subtractOneMonth(displayDate);
                setDisplayDate(previousMonth);
                setIsOpened(false);
              }}
              className="
                flex h-8 w-8 items-center justify-center
                rounded-full border border-transparent
                text-muted-foreground
                hover:border-border hover:text-foreground
                transition
              "
            >
              <ArrowLeft className="scale-[120%] transition-transform hover:scale-[140%]" />
            </button>

            {/* Next month */}
            <button
              type="button"
              aria-label="next month"
              onClick={() => {
                const nextMonth = addOneMonth(displayDate);
                setDisplayDate(nextMonth);
                setIsOpened(false);
              }}
              className="
                flex h-8 w-8 items-center justify-center
                rounded-full border border-transparent
                text-muted-foreground
                hover:border-border hover:text-foreground
                transition
              "
            >
              <ArrowLeft className="rotate-180 scale-[120%] transition-transform hover:scale-[140%]" />
            </button>
          </div>
        </div>
      </div>

      {/* Year picker */}
      {isMonthOpened && showYear && (
        <div
          className="
            absolute left-0 right-0 top-[122px] z-40
            h-full overflow-y-auto
            bg-card px-3 pb-2 pt-6
            backdrop-blur-lg
            flex flex-wrap items-center justify-center
          "
        >
          {last100years.map((year) => {
            const isYearActive = displayDate.getFullYear() === year;

            return (
              <div key={year} className="mb-3 w-4/12">
                <Button
                  onClick={() => {
                    const newYearDate = changeCalendarYear(displayDate, year);
                    setDisplayDate(newYearDate);
                    setIsOpened(false);
                  }}
                  variant={isYearActive ? 'default' : 'ghost'}
                  size="sm"
                  className="mx-auto block rounded-full px-3 text-foreground"
                >
                  {year}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
