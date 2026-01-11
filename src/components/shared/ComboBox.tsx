import {
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
} from 'react-hook-form';
import {
  Ref,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ComboboxContent } from '@/types/GenericTypes';

import ComboBoxContent, {
  ComboBoxContentImperativeRef,
} from '@/components/shared/ComboBoxContent';
import { LoadingIconSmall } from '@/components/shared/LoadingIconLarge';
import { ChevronDown } from 'lucide-react';
import SvgIcons from '@/icons/SvgIcon';

type ActionConfigProp = {
  text: string;
  onActionClick: (searchResult: string) => void;
  isPending: boolean;
};

export type ComboBoxImperativeRef = {
  closeComoBox: VoidFunction;
};

export type ComboboxFieldType<T extends FieldValues> = {
  className?: string;
  error?: string;
  disabled?: boolean;
  searchOptionsArray: ComboboxContent[];
  setValue: UseFormSetValue<T>;
  fieldName: Path<T>;
  value: string | number;
  labelText: string;
  setSearchResult: (val: string) => void;
  isError?: boolean;
  isPending: boolean;
  defaultValue?: string | null;
  onSelectCallBack?: (option: ComboboxContent) => void;
  side?: 'top' | 'bottom' | 'left' | 'right';
  actionConfigProp?: ActionConfigProp;
  comboBoxRef?: Ref<ComboBoxImperativeRef>;
  showSuccessMark?: boolean;
};

export default function ComboBox<T extends FieldValues>({
  className,
  disabled,
  error,
  searchOptionsArray,
  setValue,
  fieldName,
  value,
  labelText,
  setSearchResult,
  isError,
  isPending,
  defaultValue,
  onSelectCallBack,
  side = 'bottom',
  actionConfigProp,
  comboBoxRef,
  showSuccessMark,
}: ComboboxFieldType<T>) {
  const [open, setOpen] = useState(false);

  let comboBoxLabel: string | undefined;

  if (defaultValue) {
    comboBoxLabel = defaultValue;
  } else if (value) {
    comboBoxLabel = searchOptionsArray.find(
      (option) => option.value === value,
    )?.label;
  } else {
    comboBoxLabel = labelText;
  }

  useImperativeHandle(comboBoxRef, () => ({
    closeComoBox: () => setOpen(false),
  }));

  const contentRef = useRef<ComboBoxContentImperativeRef>(null);

  return (
    <div className="relative w-full mb-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={`
              h-12 w-full justify-between gap-2 px-3
              bg-background text-foreground
              border border-border
              hover:bg-accent
              focus-visible:ring-2 focus-visible:ring-ring
              transition-colors
              ${error ? 'border-destructive' : ''}
              ${open ? 'ring-2 ring-ring' : ''}
              ${className ?? ''}
            `}
          >
            <span className="truncate flex-1 text-left text-sm">
              {comboBoxLabel}
            </span>

            <ChevronDown className="h-4 w-4 opacity-70 shrink-0" />

            {showSuccessMark && (
              <span className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 text-primary">
                <SvgIcons.SuccessCheck className="h-5 w-5" />
                <span className="text-xs font-medium">Added</span>
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side={side}
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          className="p-0 border-border bg-popover text-popover-foreground"
        >
          <ComboBoxContent
            onSelect={(option: ComboboxContent) => {
              setValue(fieldName, option.value as PathValue<T, Path<T>>);
              setOpen(false);
              onSelectCallBack?.(option);
            }}
            isError={isError}
            isPending={isPending}
            searchOptionsArray={searchOptionsArray}
            selectedOptions={[value]}
            title={fieldName}
            setSearchResult={setSearchResult}
            contentRef={contentRef}
          />

          {actionConfigProp && (
            <div className="p-3 pt-2">
              <Button
                size="sm"
                type="button"
                disabled={actionConfigProp.isPending}
                onClick={() => {
                  const searchValue =
                    contentRef.current?.getSearchValue() ?? '';
                  actionConfigProp.onActionClick(searchValue);
                }}
                className="ml-auto flex w-36"
              >
                {actionConfigProp.isPending ? (
                  <LoadingIconSmall />
                ) : (
                  actionConfigProp.text
                )}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {error && (
        <span className="absolute -bottom-5 left-2 text-sm text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
