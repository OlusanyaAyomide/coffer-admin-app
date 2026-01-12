'use client';

import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';
import './input-field-styles.css';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

type InputFieldType<T extends FieldValues> = {
  error?: string;
  fieldName: Path<T>;
  register: UseFormRegister<T>;
  containerClassName?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  placeHolderText?: string;
  showPlaceholder?: boolean;
  maxLength?: number;
  currentLength?: number;
};

export default function TextAreaInput<T extends FieldValues>({
  containerClassName,
  fieldName,
  disabled = false,
  error,
  register,
  className,
  placeHolderText,
  placeholder,
  showPlaceholder = false,
  maxLength,
  currentLength,
}: InputFieldType<T>) {
  const {
    onChange, onBlur, name, ref,
  } = register(fieldName as Path<T>);

  return (
    <div className={cn('relative mb-4 w-full', containerClassName)}>
      {maxLength && typeof currentLength === 'number' && (
        <span className="absolute -top-[30px] right-0 text-xs md:text-sm font-medium text-muted-foreground">
          {currentLength}/{maxLength}
        </span>
      )}

      <Textarea
        id={name}
        name={name}
        ref={ref}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        placeholder={placeholder || (showPlaceholder ? placeHolderText : ' ')}
        className={cn(
          `
          h-[252px] w-full resize-none px-4 py-2
          font-light text-foreground
          border border-border
          bg-background
          transition-colors
          focus-visible:outline-none
          focus-visible:ring-primary
          focus-visible:ring-1
          focus:border-primary
          disabled:cursor-not-allowed
          disabled:opacity-50
          invalid:border-destructive
          `,
          error && 'border-destructive',
          className,
        )}
      />

      <label htmlFor={name}>
        {showPlaceholder ? ' ' : placeHolderText}
      </label>

      {error && (
        <span className="absolute -bottom-5 left-2 text-sm text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
