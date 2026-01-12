'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import type {
  FieldValues, Path, PathValue, UseFormSetValue,
} from 'react-hook-form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { titleCaseUnderscoreDash } from '@/services/TextServices';

type SelectFieldType<T extends FieldValues> = {
  className?: string;
  error?: string;
  disabled?: boolean;
  fieldName: Path<T>;
  options:
  | Array<string>
  | Array<number>
  | Array<string | number>
  | Array<{ label: string; value: string | number }>;
  placeHolderText: string;
  setValue: UseFormSetValue<T>;
  value: string | number;
  showPlaceholder?: boolean;
};

export default function SelectField<T extends FieldValues>({
  className,
  error,
  fieldName,
  options,
  placeHolderText,
  setValue,
  value,
  disabled,
  showPlaceholder,
}: SelectFieldType<T>) {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value !== undefined && value !== null && value !== '';

  const { theme } = useTheme()
  const isLight = theme === 'light'

  const triggerClasses = () => {
    if (error) {
      return 'border-destructive';
    }
    if (isFocused) {
      return 'ring-primary ring';
    }
    return 'border border-border';
  };

  const labelClasses = () => {
    if (isFocused || hasValue) {
      return `
        bg-background
        text-foreground
        -translate-y-[27px]
        text-sm
        font-normal
      `;
    }
    return 'text-muted-foreground';
  };

  const getOptionLabel = (val: string | number) => {
    if (typeof options[0] === 'object' && options[0] !== null) {
      const option = (
        options as Array<{ label: string; value: string | number }>
      ).find((o) => o.value === val);
      return option?.label ?? val;
    }
    return titleCaseUnderscoreDash(`${val}`);
  };

  return (
    <div className={`relative mb-5 w-full ${className ?? ''}`}>
      <Select
        name={fieldName}
        disabled={disabled}
        value={hasValue ? value.toString() : ''}
        onOpenChange={setIsFocused}
        onValueChange={(selectValue) => {
          setValue(fieldName, selectValue as PathValue<T, Path<T>>, { shouldDirty: true });
        }}
      >
        <SelectTrigger
          className={`
            relative flex bg-background h-10 sm:h-12 w-full items-center justify-between
            px-4 
            font-light
            transition-colors
            ${triggerClasses()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {/* Floating label */}
          {!showPlaceholder && (
            <span
              className={`
                pointer-events-none
                absolute left-4 px-1
                transition-all duration-200
                ${labelClasses()}
              `}
            >
              {placeHolderText}
            </span>
          )}

          <SelectValue placeholder={showPlaceholder ? placeHolderText : ' '}>
            {hasValue && (
              <span className="absolute left-4 top-3 text-base font-light text-foreground">
                {getOptionLabel(value)}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent
          sideOffset={10}
          className={`max-h-[280px] min-h-20 border border-border ${isLight ? 'bg-white' : 'bg-black'}`}
        >
          {options.map((item) => {
            const isObject = typeof item === 'object' && item !== null;
            const itemValue = isObject ? item.value : item;
            const itemLabel = isObject
              ? item.label
              : titleCaseUnderscoreDash(`${item}`);

            return (
              <SelectItem
                key={itemValue.toString()}
                value={itemValue.toString()}
                className={`${isLight ? 'text-black focus:text-black focus:bg-[#f4f4f5] not-data-[variant=destructive]:focus:**:text-black' : 'text-white'}`}
              >
                {itemLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {error && (
        <span className="absolute -bottom-5 left-2 text-sm text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
