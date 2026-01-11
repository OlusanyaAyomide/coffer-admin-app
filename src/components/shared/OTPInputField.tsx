'use client';

import {
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
} from 'react-hook-form';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input.otp';

import { cn } from '@/lib/utils';

type OTPInputFieldProps<T extends FieldValues> = {
  fieldName: Path<T>;
  value?: string;
  setValue: UseFormSetValue<T>;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export default function OTPInputField<T extends FieldValues>({
  fieldName,
  value = '',
  setValue,
  maxLength = 6,
  error,
  disabled,
  className,
}: OTPInputFieldProps<T>) {


  return (
    <div className={cn('relative w-fit mb-2', className)}>
      <InputOTP
        value={value}
        maxLength={maxLength}
        inputMode="numeric"
        disabled={disabled}
        onChange={(otpValue) =>
          setValue(fieldName, otpValue as PathValue<T, Path<T>>)
        }
        className={cn(
          'rounded-md transition-all',
          error && 'border-destructive',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} className={`h-12 w-12 ${error && "border-destructive"}`} />
          <InputOTPSlot index={1} className={`h-12 w-12 ${error && "border-destructive"}`} />
        </InputOTPGroup>

        <InputOTPSeparator />

        <InputOTPGroup>
          <InputOTPSlot index={2} className={`h-12 w-12 ${error && "border-destructive"}`} />
          <InputOTPSlot index={3} className={`h-12 w-12 ${error && "border-destructive"}`} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={4} className={`h-12 w-12 ${error && "border-destructive"}`} />
          <InputOTPSlot index={5} className={`h-12 w-12 ${error && "border-destructive"}`} />
        </InputOTPGroup>
      </InputOTP>

      {error && (
        <span className="absolute -bottom-5 left-1 text-sm text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}