'use client';

import { FieldValues, Path, UseFormRegister } from 'react-hook-form';
import './input-field-styles.css';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeClosed } from 'lucide-react';
import { InputType } from '@/types/GenericTypes';

type InputFieldType<T extends FieldValues> = {
  error?: string;
  fieldName: Path<T>;
  register: UseFormRegister<T>;
  containerClassName?: string;
  className?: string;
  disabled?: boolean;
  type?: InputType;
  showPasswordToggle?: boolean;
  onPasswordToggle?: () => void;
  placeHolderText?: string;
  showPlaceholder?: boolean;
  readonly?: boolean
  onClick?: VoidFunction;
};

export default function InputField<T extends FieldValues>({
  containerClassName,
  type = 'text',
  fieldName,
  disabled = false,
  error,
  register,
  className,
  showPasswordToggle,
  onPasswordToggle,
  placeHolderText,
  showPlaceholder = false,
  readonly = false,
  onClick,
}: InputFieldType<T>) {
  const {
    onChange, onBlur, name, ref,
  } = register(fieldName as Path<T>);

  return (
    <div className={cn('relative mb-5 w-full', containerClassName)}>
      <Input
        id={name}
        name={name}
        onClick={onClick}
        ref={ref}
        type={type}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={readonly}
        placeholder={showPlaceholder ? placeHolderText : ' '}
        className={cn(
          `
          h-10 sm:h-12 w-full px-4 py-1
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

      {/* Label hook preserved */}
      <label htmlFor={name}>
        {showPlaceholder ? ' ' : placeHolderText}
      </label>

      {/* Password toggle */}
      {showPasswordToggle && (
        <button
          type="button"
          aria-label="toggle-password"
          onClick={onPasswordToggle}
          className={cn(
            'absolute right-2 rounded-full p-2',
            type === 'password' ? 'top-1' : 'top-1',
          )}
        >
          {type === 'text' ? <EyeClosed /> : <Eye />}
        </button>
      )}

      {error && (
        <span className="absolute -bottom-5 left-2 text-sm text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
