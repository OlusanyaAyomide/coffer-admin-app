import {
  Dispatch, SetStateAction, useEffect, useRef, useState,
} from 'react';
import { titleCase } from 'title-case';


import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';


import ComboBoxContent, { ComboBoxContentImperativeRef } from '@/components/shared/ComboBoxContent';
import { FilterTrigger } from '@/components/shared/FilterButtons';
import SvgIcons from '@/icons/SvgIcon';
import useFilterSearchParam from '@/hooks/useFilterSearchParam';

type FilterOption = { label: string; value: string };
type FilterButtonType = {
  activeFilters: string[];
  setActiveFilters: Dispatch<SetStateAction<string[]>>;
  title: string;
  filterOptions: FilterOption[];
  filterKey: string
  setSearchResult: (val: string) => void
  isError?: boolean
  isPending: boolean
  filterMode?: 'single' | 'multiple'
};

export default function ComboBoxFilter({
  activeFilters,
  setActiveFilters,
  title,
  filterOptions,
  filterKey,
  setSearchResult,
  isError,
  isPending,
  filterMode = 'multiple',

}: FilterButtonType) {
  const { setParam } = useFilterSearchParam(filterKey);

  const [selectedOptions, setSelectedOptions] = useState<string[]>(activeFilters);

  const handleFilterChange = (filter: FilterOption) => {
    if (filterMode === 'single') {
      setSelectedOptions([filter.value]);
    } else {
      setSelectedOptions((prev) => {
        if (prev.includes(filter.value)) {
          return prev.filter((val) => val !== filter.value);
        }
        return [...prev, filter.value];
      });
    }
  };

  const closeRef = useRef<HTMLButtonElement>(null);

  const setFilterChange = () => {
    setActiveFilters(selectedOptions);
    setParam(selectedOptions);
    closeRef.current?.click();
  };

  const selectAllFields = () => {
    const allFilterValue = filterOptions.map(((filter) => filter.value));
    setSelectedOptions(allFilterValue);
  };

  useEffect(() => {
    setSelectedOptions(activeFilters);
  }, [activeFilters]);

  const contentRef = useRef<ComboBoxContentImperativeRef>(null);

  const { CancelIconX } = SvgIcons;

  return (
    <div>
      <Popover modal>
        <PopoverTrigger className="max-md:hidden" asChild>
          <div className="w-fit">
            <FilterTrigger
              title={titleCase(title)}
              isActive={!!activeFilters.length}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="max-md:hidden p-6 w-[372px] relative"
          role="menu"
        >
          <PopoverClose ref={closeRef} className="ml-auto flex w-fit absolute top-6 right-6">
            <CancelIconX className="text-muted-foreground hover:text-foreground" />
          </PopoverClose>
          <ComboBoxContent
            onSelect={(option) => { handleFilterChange(option); }}
            title={title}
            isPending={isPending}
            isError={isError}
            selectedOptions={selectedOptions}
            setSearchResult={setSearchResult}
            searchOptionsArray={filterOptions}
            contentRef={contentRef}
            addTitle
          />
          <div className="flex-center justify-between">
            <Button
              disabled={selectedOptions.length === filterOptions.length}
              onClick={selectAllFields}
              variant="ghost"
              className="flex mt-4 px-3"
            >
              Select all
            </Button>
            <Button
              disabled={selectedOptions.length === 0}
              onClick={() => { setSelectedOptions([]); }}
              variant="ghost"
              className="flex mt-4 px-2"
            >
              Deselect All
            </Button>
            <Button
              onClick={setFilterChange}
              variant="ghost"
              className="flex mt-4 px-6"
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
