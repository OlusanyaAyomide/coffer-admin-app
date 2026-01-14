import {
  useRef, useState,
} from 'react';
import { titleCase } from 'title-case';

import { ChevronDown } from 'lucide-react';
import type {
  Dispatch, SetStateAction
} from 'react';
import {
  Popover, PopoverClose, PopoverContent, PopoverTrigger
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
import useFilterSearchParam from '@/hooks/useFilterSearchParam';
import { cn } from '@/lib/utils';


type FilterOption = { label: string, value: string };
type FilterButtonType = {
  activeFilters: Array<string>
  setActiveFilters: Dispatch<SetStateAction<Array<string>>>
  title: string
  filterOptions: Array<FilterOption>
  filterKey: string
};

export function FilterTrigger({
  title,
  isActive,
}: {
  title: string;
  isActive: boolean;
}) {
  const { FilterCheck } = SvgIcons;

  return (
    <Button
      variant={isActive ? 'secondary' : 'outline'}
      size="sm"
      className={cn(
        'flex items-center gap-1 sm:gap-3',
        'transition-colors',
        isActive && 'bg-accent ring ring-primary/70',
        !isActive && 'border-border'
      )}
    >
      <FilterCheck
        className={cn(
          'transition-all duration-200',
          isActive ? 'w-4 opacity-100' : 'hidden'
        )}
      />
      <span className={`${!isActive && "ml-2"}`}>{title}</span>
      <ChevronDown className="text-muted-foreground" />
    </Button>
  );
}


function FilterContent({
  filterOptions,
  title,
  activeFilters,
  setActiveFilters,
  className,
  filterKey,
}: FilterButtonType & { className?: string }) {
  const [selectedOptions, setSelectedOptions] =
    useState<Array<string>>(activeFilters);

  const closeRef = useRef<HTMLButtonElement>(null);
  const { setParam } = useFilterSearchParam(filterKey);

  const applyFilters = () => {
    setActiveFilters(selectedOptions);
    setParam(selectedOptions);
    closeRef.current?.click();
  };

  const toggleFilter = (filter: FilterOption) => {
    setSelectedOptions((prev) =>
      prev.includes(filter.value)
        ? prev.filter((v) => v !== filter.value)
        : [...prev, filter.value]
    );
  };

  const selectAll = () => {
    setSelectedOptions(filterOptions.map((f) => f.value));
  };

  return (
    <div className={cn('space-y-6 relative', className)}>
      <PopoverClose ref={closeRef} className="ml-auto flex absolute top-1 right-2">
        <SvgIcons.CancelIconX className="text-muted-foreground hover:text-foreground" />
      </PopoverClose>

      <h2 className="text-lg font-medium sm:text-2xl text-popover-foreground text-center md:text-left">
        {titleCase(title)}
      </h2>

      {/* Options */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-2">
        {filterOptions.map((item, index) => (
          <div
            key={(index + 1).toString()}
            className="flex items-center gap-2 text-sm text-foreground"
          >
            <Checkbox
              checked={selectedOptions.includes(item.value)}
              onCheckedChange={() => toggleFilter(item)}
              className={cn(
                'h-[18px] w-[18px] rounded-3xl',
                'data-[state=checked]:bg-primary',
                'data-[state=checked]:border-primary'
              )}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={selectAll}
          disabled={selectedOptions.length === filterOptions.length}
        >
          Select all
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedOptions([])}
          disabled={selectedOptions.length === 0}
        >
          Deselect all
        </Button>

        <Button
          size="sm"
          onClick={applyFilters}
          className="ml-auto bg-primary text-primary-foreground"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

export default function FilterButtons({
  title,
  setActiveFilters,
  activeFilters,
  filterOptions,
  filterKey,
}: FilterButtonType) {
  return (
    <div>
      <Popover modal>
        <PopoverTrigger asChild className="max-md:hidden">
          <div className="w-fit">
            <FilterTrigger
              title={titleCase(title)}
              isActive={!!activeFilters.length}
            />
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="hidden md:block w-[372px] p-6 bg-popover text-popover-foreground border border-border"
        >
          <FilterContent
            title={title}
            filterKey={filterKey}
            setActiveFilters={setActiveFilters}
            activeFilters={activeFilters}
            filterOptions={filterOptions}
          />
        </PopoverContent>

        <Drawer>
          <DrawerTrigger asChild className="md:hidden">
            <div>
              <FilterTrigger
                title={titleCase(title)}
                isActive={!!activeFilters.length}
              />
            </div>
          </DrawerTrigger>

          <DrawerContent className="md:hidden min-h-[70vh] p-6 bg-background text-foreground">
            <DrawerTitle />
            <DrawerDescription />
            <FilterContent
              title={title}
              className="mt-6"
              setActiveFilters={setActiveFilters}
              activeFilters={activeFilters}
              filterOptions={filterOptions}
              filterKey={filterKey}
            />
          </DrawerContent>
        </Drawer>
      </Popover>
    </div>
  );
}
