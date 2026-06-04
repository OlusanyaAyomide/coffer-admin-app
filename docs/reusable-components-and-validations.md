# Reusable Components, Hooks, Icons, & Validations Guide

This document describes the key structural elements, reuse patterns, validation logic, and icon system in **Coffer Admin**. It serves as a developer guide for extending or modifying the codebase in accordance with the established patterns.

---

## 1. Directory Structure

The project code is located under the `src` directory, structured as follows:

```
src/
├── components/          # React components
│   ├── ui/              # Low-level primitive components (e.g., buttons, tables, dialogs)
│   ├── shared/          # Reusable application components (e.g., InputField, OTPInputField)
│   └── kyc/, users/, etc. # Feature-specific components
├── constants/           # Centralized constants and config keys
├── hooks/               # Custom hooks (e.g., useGetRequests, usePostRequests, useTokenRefresh)
├── icons/               # Centralized SVG icons package (SvgIcon.tsx)
├── lib/                 # Utility files (e.g., cn tailwind merge helper)
├── routes/              # Routing configurations and page views
├── services/            # Reusable business logic, API instances, cookies, and validations
└── validations/         # Form validation schemas matching backend expectations
```

---

## 2. Reusable Form Components

Instead of writing raw `<input>` or `<select>` elements, we use wrapped form components in [src/components/shared](file:///Users/mac/Documents/utilor/coffer-admin/src/components/shared) that handle accessibility, floating/static labels, and error display internally.

### 2.1 Standard Inputs (`InputField`)

The [InputField.tsx](file:///Users/mac/Documents/utilor/coffer-admin/src/components/shared/InputField.tsx) component encapsulates a text/password/email input. It is fully typed and uses generics to enforce type safety on fields registered with `react-hook-form`.

#### Key Features:
- Accepts `register` and `fieldName` from React Hook Form.
- Direct forwarding of `onChange`, `onBlur`, `ref`, and `name` properties returned by `register`.
- Handles password visibility toggles internally.
- Standardizes styling and error text display.

**Implementation Example:**
```typescript
import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type InputFieldType<T extends FieldValues> = {
  error?: string;
  fieldName: Path<T>;
  register: UseFormRegister<T>;
  placeHolderText?: string;
  showPlaceholder?: boolean;
  type?: string;
  showPasswordToggle?: boolean;
  onPasswordToggle?: () => void;
  // ... other optional parameters
};

export default function InputField<T extends FieldValues>({
  fieldName,
  register,
  error,
  placeHolderText,
  showPlaceholder = false,
  type = 'text',
  showPasswordToggle,
  onPasswordToggle,
  ...props
}: InputFieldType<T>) {
  const { onChange, onBlur, name, ref } = register(fieldName);

  return (
    <div className="relative mb-5 w-full">
      <Input
        id={name}
        name={name}
        ref={ref}
        type={type}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={showPlaceholder ? placeHolderText : ' '}
        className={cn(error && 'border-destructive')}
        {...props}
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
```

### 2.2 Programmatic Inputs (`OTPInputField`)

For inputs that are not native `<input>` wrappers (e.g., segmented code input slots), we use `setValue` from `react-hook-form` to handle updates programmatically instead of a direct `register`.

The [OTPInputField.tsx](file:///Users/mac/Documents/utilor/coffer-admin/src/components/shared/OTPInputField.tsx) implements this:

```typescript
import type { FieldValues, Path, PathValue, UseFormSetValue } from 'react-hook-form';
import { InputOTP } from '@/components/ui/input.otp';

type OTPInputFieldProps<T extends FieldValues> = {
  fieldName: Path<T>;
  value?: string;
  setValue: UseFormSetValue<T>;
  maxLength?: number;
  error?: string;
};

export default function OTPInputField<T extends FieldValues>({
  fieldName,
  value = '',
  setValue,
  maxLength = 6,
  error,
}: OTPInputFieldProps<T>) {
  return (
    <div className="relative mb-2">
      <InputOTP
        value={value}
        maxLength={maxLength}
        onChange={(otpValue) =>
          setValue(fieldName, otpValue as PathValue<T, Path<T>>)
        }
      />
      {error && (
        <span className="absolute -bottom-5 left-1 text-sm text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
```

---

## 3. Centralized Icons Registry

Instead of importing individual SVG assets or external libraries ad-hoc, we maintain a single centralized registry of custom icons in [SvgIcon.tsx](file:///Users/mac/Documents/utilor/coffer-admin/src/icons/SvgIcon.tsx).

### 3.1 Design Principles
1. **Consistency**: Icons are mapped to a central `SvgIcons` configuration object.
2. **Styling & Flexibility**: Each icon is a React functional component accepting standard props like `LucideProps` (including `className` and `style`).
3. **Responsive Color**: Use `fill="currentColor"` or `stroke="currentColor"` so icons automatically adapt to the parent context's text color.

### 3.2 Usage
```typescript
import SvgIcons from '@/icons/SvgIcon';

function SampleComponent() {
  return (
    <div className="flex items-center gap-2 text-primary hover:text-primary/80">
      <SvgIcons.Home className="h-5 w-5" />
      <span>Dashboard</span>
    </div>
  );
}
```

---

## 4. Services Validations & Reusable Rules

Validation schemas are configured with **Yup**. To prevent duplication of validation rules (e.g., password criteria, date checks, email patterns), the core constraints are written as helper functions in [ValidationServices.ts](file:///Users/mac/Documents/utilor/coffer-admin/src/services/ValidationServices.ts).

### 4.1 Reusable Validation Rules
Some common validator functions include:
- [validateRequiredString](file:///Users/mac/Documents/utilor/coffer-admin/src/services/ValidationServices.ts#L6-L13): Trims whitespace, checks for presence, and ensures the string is not empty.
- [validateRequiredEmail](file:///Users/mac/Documents/utilor/coffer-admin/src/services/ValidationServices.ts#L72-L81): Standard email regex assertion.
- [validateRequiredPassword](file:///Users/mac/Documents/utilor/coffer-admin/src/services/ValidationServices.ts#L89-L98): Enforces a minimum length of 8 characters, at least one digit, and one uppercase letter.
- [validateRequiredPasswordConfirmation](file:///Users/mac/Documents/utilor/coffer-admin/src/services/ValidationServices.ts#L100-L107): Verifies that it matches the reference password field.

**Example Implementation from [ValidationServices.ts](file:///Users/mac/Documents/utilor/coffer-admin/src/services/ValidationServices.ts):**
```typescript
export function validateRequiredPassword(fieldName: string): yup.StringSchema<string> {
  return yup.string()
    .required(`${fieldName} is required`)
    .min(8, `${fieldName} should be at least 8 characters`)
    .matches(/[a-zA-Z]/, `${fieldName} should contain alphabets`)
    .matches(/[A-Z]/, `${fieldName} should contain at least one uppercase letter`)
    .matches(/[0-9]/, `${fieldName} should contain at least one number`);
}
```

### 4.2 Feature-Specific Validation Schemas
Feature-specific schemas are defined in the `src/validations` directory (such as [AuthValidations.ts](file:///Users/mac/Documents/utilor/coffer-admin/src/validations/AuthValidations.ts)). They pull helper rules from [ValidationServices.ts](file:///Users/mac/Documents/utilor/coffer-admin/src/services/ValidationServices.ts):

```typescript
import * as yup from 'yup';
import {
  validateRequiredEmail,
  validateRequiredPassword
} from '@/services/ValidationServices';

export type UserLoginFormData = {
  email: string;
  password: string;
}

export const loginSchema: yup.ObjectSchema<UserLoginFormData> = yup.object({
  email: validateRequiredEmail('E-mail'),
  password: validateRequiredPassword('Password'),
});
```

---

## 5. React Hook Form Integration

React Hook Form leverages `@hookform/resolvers/yup` to integrate our validation schemas.

### 5.1 Step-by-Step Flow:
1. **Initialize `useForm`**: Pass the type definition (`UserLoginFormData`) and specify the validation schema using `yupResolver`.
2. **Deconstruct Form Hooks**: Pull out `register`, `handleSubmit`, `setValue` (if using custom inputs like OTP), and `formState: { errors }`.
3. **Register and Connect Inputs**: Bind inputs to RHF using the `<InputField>` wrapper.
4. **Trigger Submit**: Pass your custom handler function to `handleSubmit`.

**Complete Flow Example (as seen in [login.tsx](file:///Users/mac/Documents/utilor/coffer-admin/src/routes/_auth/login.tsx)):**

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, UserLoginFormData } from '@/validations/AuthValidations';
import InputField from '@/components/shared/InputField';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = (data: UserLoginFormData) => {
    // Send data to backend endpoint
    console.log("Submit Payload:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Email</label>
        <InputField
          fieldName="email"
          register={register}
          error={errors.email?.message}
          placeHolderText="admin@coffer.com"
          showPlaceholder
        />
      </div>

      <div>
        <label>Password</label>
        <InputField
          fieldName="password"
          register={register}
          error={errors.password?.message}
          placeHolderText="••••••••"
          showPlaceholder
          type="password"
        />
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## 6. Custom HTTP Query Hooks

To keep query/mutation logic clean and separated from layout code, we use custom TanStack Query wrappers.

### 6.1 Data Fetching (`useGetRequest`)
Configured in [useGetRequests.tsx](file:///Users/mac/Documents/utilor/coffer-admin/src/hooks/useGetRequests.tsx), this hook handles caching, query parameter dependencies, page visibility listeners, and token refresh verification.

**Usage:**
```typescript
import useGetRequest from '@/hooks/useGetRequests';

interface UserListResponse {
  success: boolean;
  data: {
    users: Array<{ id: string; name: string }>;
  };
}

const { data, isLoading } = useGetRequest<UserListResponse, unknown>({
  URL: '/admin/users',
  queryKey: ['admin-users-list'],
  params: { page: 1, limit: 10 } // automatically added to queryKey dependencies
});
```

### 6.2 Data Mutations (`usePostRequest`)
Configured in [usePostRequests.tsx](file:///Users/mac/Documents/utilor/coffer-admin/src/hooks/usePostRequests.tsx), this hook wraps mutations (POST, PUT, DELETE) and manages notifications automatically via the `sonner` toast system.

**Usage:**
```typescript
import usePostRequest from '@/hooks/usePostRequests';

const { mutate, isPending } = usePostRequest<SuccessResponseType, PayloadType>({
  URL: '/admin/users/create',
  successText: 'User created successfully',
  showErrorToast: true,
  onSuccess: (data) => {
    // trigger state invalidation or redirect
  }
});
```
