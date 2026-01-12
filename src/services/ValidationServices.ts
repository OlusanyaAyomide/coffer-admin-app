import * as yup from 'yup';
import type { DocumentMetaData, NullableType } from '../types/GenericTypes';
import { returnDataOrNull } from '@/services/emptyDataServices';


export function validateRequiredString(
  fieldName: string,
): yup.StringSchema<string, yup.AnyObject> {
  return yup.string()
    .trim()
    .required(`${fieldName} is required`)
    .test('is-not-empty', `${fieldName} cannot be empty`, (value) => value !== '');
}

export function validateOptionalString():
  yup.StringSchema<yup.Maybe<string | null | undefined>, yup.AnyObject> {
  return yup.string()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .trim()
    .nullable()
    .optional()
    .notRequired()
    .test('is-not-whitespace-only', 'String cannot be only whitespace', (value) => {
      if (value == null) return true;
      return value !== '';
    });
}

export function validateRequiredNumber(
  fieldName: string,
  config?: { min?: number, max?: number },
): yup.NumberSchema<number, yup.AnyObject> {
  let schema = yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .required(`${fieldName} is required`)
    .typeError('A valid number is required')
    .min(0, `${fieldName} must be greater than or equal to 0`);

  if (config?.max !== undefined) {
    schema = schema.max(config.max, `${fieldName} must be less than or equal to ${config.max}`);
  }

  if (config?.min !== undefined) {
    schema = schema.min(config.min, `${fieldName} must be greater than or equal to ${config.min}`);
  }

  return schema;
}

export function validateOptionalNumber(
  fieldName: string,
  config?: { min?: number, max?: number },
): yup.NumberSchema<yup.Maybe<number | null | undefined>, yup.AnyObject> {
  let schema = yup.number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .typeError(`${fieldName} must be a valid number`)
    .min(0, `${fieldName} must be greater than or equal to 0`)
    .nullable()
    .notRequired();

  if (config?.max !== undefined) {
    schema = schema.max(config.max, `${fieldName} must be less than or equal to ${config.max}`);
  }

  if (config?.min !== undefined) {
    schema = schema.min(config.min, `${fieldName} must be greater than or equal to ${config.min}`);
  }

  return schema;
}

export function validateRequiredEmail(
  fieldName: string,
): yup.StringSchema<string, yup.AnyObject> {
  return yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      `Invalid ${fieldName}`,
    )
    .required(`${fieldName} is required`);
}

export function validateRequiredDate(fieldName: string): yup.DateSchema<Date, yup.AnyObject> {
  return yup.date()
    .required(`${fieldName} is required`)
    .typeError(`${fieldName} must be a valid date`);
}

export function validateRequiredPassword(
  fieldName: string,
): yup.StringSchema<string, yup.AnyObject> {
  return yup.string()
    .required(`${fieldName} is required`)
    .min(8, `${fieldName} should be at least 8 characters`)
    .matches(/[a-zA-Z]/, `${fieldName} should contain alphabets`)
    .matches(/[A-Z]/, `${fieldName} should contain at least one uppercase letter`)
    .matches(/[0-9]/, `${fieldName} should contain at least one number`);
}

export function validateRequiredPasswordConfirmation(
  fieldName: string,
  refField: string,
): yup.StringSchema<string, yup.AnyObject> {
  return yup.string()
    .oneOf([yup.ref(refField)], `${fieldName} must match`)
    .required(`${fieldName} is required`);
}

export function isValidCreditCard(value: string): boolean {
  if (!value) return false;
  const sanitized = value.replace(/\D/g, ''); // Remove non-numeric characters
  let sum = 0;
  let shouldDouble = false;


  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateRequiredDocumentMetaData(
  fieldName: string,
): yup.ObjectSchema<Omit<DocumentMetaData, 'uploaded_at' | 'key'>> {
  return yup
    .object()
    .shape({
      id: validateRequiredString('ID'),
      name: validateRequiredString('Name'),
      size: validateRequiredString('Size'),
      url: validateRequiredString('Url'),
    }).transform((value, originalValue) => (returnDataOrNull(originalValue) ? value : null))
    .test(
      'document-meta-valid',
      `${fieldName} is required`,
      (value) => !!value
        && !!value.name
        && !!value.size
        && !!value.url,
    )
    .required(`${fieldName} is required`) as yup.ObjectSchema<Omit<DocumentMetaData, 'uploaded_at' | 'key'>>;
}

export function validateOptionalDocumentMetaData(
  fieldName = 'Document',
): yup.ObjectSchema<NullableType<DocumentMetaData>> {
  return yup
    .object({
      name: validateOptionalString(),
      size: validateOptionalString(),
      url: validateOptionalString(),
    })
    .default(null)
    .nullable()
    .notRequired()
    .test(
      'document-meta-valid',
      `${fieldName} must include name, size, and a valid URL`,
      (value) => {
        if (!value || Object.keys(value).length === 0) return true;
        return (
          typeof value.name === 'string'
          && !!value.name.trim()
          && typeof value.size === 'string'
          && !!value.size.trim()
          && typeof value.url === 'string'
          && !!value.url.trim()
        );
      },
    )
    .optional() as unknown as yup.ObjectSchema<NullableType<DocumentMetaData>>;
}

export function validateRequiredFutureDate(
  fieldName: string,
): yup.StringSchema<string, yup.AnyObject> {
  return yup
    .string()
    .trim()
    .required(`${fieldName} is required`)
    .test('is-not-empty', `${fieldName} cannot be empty`, (value) => value !== '')
    .test('is-not-past', `${fieldName} cannot be in the past`, (value) => {
      if (!value) return false;

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return false;

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      return date.getTime() >= now.getTime();
    });
}

export function validateOptionalFutureDate(
  fieldName: string,
): yup.StringSchema<yup.Maybe<string | null | undefined>, yup.AnyObject> {
  return yup
    .string()
    .transform((value, originalValue) => (originalValue?.trim() === '' ? null : value))
    .nullable()
    .notRequired()
    .test(
      'is-future-date',
      `${fieldName} must be in the future`,
      (value) => {
        if (!value) return true;

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return false;

        return date.getTime() > Date.now();
      },
    );
}

export function validateRequiredPhoneNumber() {
  return validateRequiredString('Phone Number')
    // .matches(/^[0-9]+$/, 'Phone number must contain only digits');
    .min(6, 'Phone number is too short')
    .max(25, 'Phone number is too long');
}
