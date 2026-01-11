import {
  useRef,
  useState,
  useImperativeHandle,
  Ref,
} from 'react';
import { Check } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import {
  titleCaseUnderscoreDash,
  truncateStringByLength,
} from '@/services/TextServices';
import SvgIcons from '@/icons/SvgIcon';
import { DEBOUNCE_IN_MS } from '@/constants/Constants';
import { ComboboxContent } from '@/types/GenericTypes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoadingIconLarge } from './LoadingIconLarge';

export type ComboBoxContentImperativeRef = {
  getSearchValue: () => string;
};

type ComboBoxContentProps = {
  onSelect: (option: ComboboxContent) => void;
  setSearchResult: (val: string) => void;
  searchOptionsArray: ComboboxContent[];
  title: string;
  isPending: boolean;
  isError?: boolean;
  selectedOptions: (string | number)[];
  addTitle?: boolean;
  contentRef: Ref<ComboBoxContentImperativeRef>;
};

export default function ComboBoxContent({
  onSelect,
  setSearchResult,
  searchOptionsArray,
  title,
  isPending,
  isError,
  selectedOptions,
  addTitle,
  contentRef,
}: ComboBoxContentProps) {
  const [searchValue, setSearchValue] = useState('');
  const debounceTimeOut = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (value: string) => {
    if (debounceTimeOut.current) {
      clearTimeout(debounceTimeOut.current);
    }

    setSearchValue(value);

    debounceTimeOut.current = setTimeout(() => {
      setSearchResult(value);
    }, DEBOUNCE_IN_MS);
  };

  const { CancelIcon3 } = SvgIcons;

  const searchKeywords = searchOptionsArray.flatMap((item) =>
    item.sub_label ? [item.sub_label, item.label] : item.label,
  );

  useImperativeHandle(contentRef, () => ({
    getSearchValue: () => searchValue,
  }));

  return (
    <div className="text-foreground">
      {addTitle && (
        <h2 className="pl-4 font-medium text-lg sm:text-2xl max-md:text-center">
          {titleCaseUnderscoreDash(title)}
        </h2>
      )}

      <Command className="bg-transparent ">
        {/* Search input */}
        <div className="relative w-full pb-[2px]">
          <CommandInput
            value={searchValue}
            onValueChange={handleSearch}
            placeholder="Search"
            className="text-sm"
          />

          {searchValue && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSearchValue('')}
              className="absolute right-5 top-3 7 h-5 w-5 opacity-60 hover:opacity-100 hover:bg-transparent"
            >
              <CancelIcon3 />
            </Button>
          )}
        </div>

        <CommandList>
          <CommandEmpty
            className={cn(
              'h-20 flex items-center justify-center text-muted-foreground',
              (isPending || isError) && 'hidden',
            )}
          >
            {searchValue
              ? 'No matches found'
              : 'Type to see suggestions...'}
          </CommandEmpty>

          <CommandGroup>
            {searchOptionsArray.map((option, index) => (
              <div key={`${index}-${option.value}`}>
                {option.sub_label && (
                  <hr className="my-1 border-border" />
                )}

                <CommandItem
                  value={String(option.value)}
                  keywords={searchKeywords}
                  onSelect={() => onSelect(option)}
                  className="
                    flex gap-2 items-start
                    cursor-pointer
                    aria-selected:bg-accent
                    hover:bg-accent
                    transition-colors
                  "
                >
                  <Check
                    className={cn(
                      'mt-1 h-4 w-4 shrink-0 text-primary transition-opacity',
                      selectedOptions.includes(option.value)
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />

                  <div className="flex flex-col">
                    <span className="text-sm leading-[150%]">
                      {truncateStringByLength(option.label, 30)}
                    </span>

                    {option.sub_label && (
                      <span className="text-xs leading-[150%] text-muted-foreground">
                        {option.sub_label}
                      </span>
                    )}
                  </div>
                </CommandItem>
              </div>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>

      {isError && (
        <div className="h-20 px-2 flex flex-col justify-center text-sm text-muted-foreground">
          <span className="mb-1">
            We couldn&apos;t load your options.
          </span>
          <span>Please try typing again or refresh the page.</span>
        </div>
      )}

      <LoadingIconLarge
        isLoading={isPending}
        className="h-28"
        svgClassName="h-[40px] w-[40px] -mt-4"
      />
    </div>
  );
}
