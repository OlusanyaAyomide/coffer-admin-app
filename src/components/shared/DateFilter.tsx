'use client';

import {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
} from 'react';
import { titleCase } from 'title-case';
import { DateRange } from 'react-day-picker';
import { ChevronDown } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from '@/components/ui/popover';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import SvgIcons from '@/icons/SvgIcon';
import CustomFilterDialog from './CustomFilterDialog';
import useFilterSearchParam from '@/hooks/useFilterSearchParam';
import { formatDate, isArrayCustomDate } from '@/services/TimeServices';
import { cn } from '@/lib/utils';

const dateFilterOptions = [
  'Today',
  'Yesterday',
  'This Week',
  'Last Week',
  'This Month',
  'This Year',
  'Custom',
];

type FilterButtonType = {
  title: string;
  filterKey: string;
  activeFilters: string[];
  setActiveFilters: Dispatch<SetStateAction<string[]>>;
};

function DateFilterTrigger({
  title,
  isActive,
}: {
  title: string;
  isActive: boolean;
}) {
  const { FilterCheck } = SvgIcons;

  return (
    <Button
      variant={isActive ? 'ghost' : 'outline'}
      size="sm"
      className={cn(
        'flex items-center gap-2 transition-all duration-200',
        isActive
          ? 'bg-accent text-accent-foreground hover:bg-accent/80 ring ring-primary/70'
          : 'border-border'
      )}
    >
      <FilterCheck
        className={cn(
          'transition-all duration-200',
          isActive ? 'w-4 opacity-100' : 'hidden'
        )}
      />
      <span className={`${!isActive && 'ml-2'}`}>{title}</span>
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
}

function DateFilterContent({
  title,
  filterKey,
  activeFilters,
  setActiveFilters,
  className,
}: FilterButtonType & { className?: string }) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(activeFilters);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { setParam } = useFilterSearchParam(filterKey);
  const { CancelIconX } = SvgIcons;

  const applyFilters = () => {
    setActiveFilters(selectedOptions);
    setParam(selectedOptions);
    closeRef.current?.click();
  };

  const handleFilterToggle = (filter: string) => {
    const isCustomActive = isArrayCustomDate(selectedOptions);

    if (filter === 'Custom' && isCustomActive) {
      setSelectedOptions([]);
      return;
    }

    setSelectedOptions((prev) =>
      prev.includes(filter) ? [] : [filter]
    );
  };

  const onDateRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return;

    setSelectedOptions([
      formatDate(range.from),
      formatDate(range.to),
    ]);
  };

  return (
    <div className={cn('space-y-6 relative', className)}>
      <PopoverClose ref={closeRef} className="ml-auto flex w-fit absolute top-2 right-2">
        <CancelIconX />
      </PopoverClose>

      <h2 className="text-lg font-medium sm:text-2xl text-center sm:text-left">
        {titleCase(title)}
      </h2>

      <div className="grid grid-cols-2 gap-y-3">
        {dateFilterOptions.map((item) => {
          const isCustomChecked =
            item === 'Custom' && isArrayCustomDate(selectedOptions);

          return (
            <div key={item} className="flex items-start gap-2">
              {item === 'Custom' ? (
                <CustomFilterDialog
                  onDateSelect={onDateRangeSelect}
                  disabled={isCustomChecked}
                >
                  <Checkbox
                    checked={isCustomChecked}
                    onCheckedChange={() => handleFilterToggle(item)}
                    className="
                      h-[18px] w-[18px]
                      rounded-3xl
                      data-[state=checked]:bg-primary
                      data-[state=checked]:border-primary
                    "
                  />
                </CustomFilterDialog>
              ) : (
                <Checkbox
                  checked={selectedOptions.includes(item)}
                  onCheckedChange={() => handleFilterToggle(item)}
                  className="
                    h-[18px] w-[18px]
                    rounded-3xl
                    data-[state=checked]:bg-primary
                    data-[state=checked]:border-primary
                  "
                />
              )}

              <div className="flex flex-col">
                <span>{item}</span>

                {isCustomChecked && (
                  <span className="mt-1 inline-flex w-fit rounded-3xl bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {selectedOptions[0]} – {selectedOptions[1]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={applyFilters} className="px-6">
          Apply
        </Button>
      </div>
    </div>
  );
}

export default function DateFilterButtons({
  title,
  filterKey,
  activeFilters,
  setActiveFilters,
}: FilterButtonType) {
  const isActive = activeFilters.length > 0;

  return (
    <Popover modal>
      {/* Desktop */}
      <PopoverTrigger asChild className="max-md:hidden">
        <div className="w-fit">
          <DateFilterTrigger
            title={titleCase(title)}
            isActive={isActive}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="hidden w-[372px] p-6 md:block"
      >
        <DateFilterContent
          title={title}
          filterKey={filterKey}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
        />
      </PopoverContent>

      {/* Mobile */}
      <Drawer>
        <DrawerTrigger asChild className="md:hidden">
          <div>
            <DateFilterTrigger
              title={titleCase(title)}
              isActive={isActive}
            />
          </div>
        </DrawerTrigger>

        <DrawerContent className="min-h-[70vh] px-4 py-6 md:hidden">
          <DrawerTitle />
          <DrawerDescription />
          <DateFilterContent
            title={title}
            filterKey={filterKey}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            className="mt-6"
          />
        </DrawerContent>
      </Drawer>
    </Popover>
  );
}
