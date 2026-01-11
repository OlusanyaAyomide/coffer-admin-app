import { NullableType } from '@/types/GenericTypes';

/**
 * Check if an optional field value returned from an api call is empty or null
 */
function handleOptionalData<T>(
  data: NullableType<T>,
  config?: {
    showEmptyString: boolean
  },
): T | 'N/A' | '' {
  if (
    data === ''
    || data === null
    || data === undefined
    || ((typeof data === 'object') && (Object.keys(data).length === 0))) {
    return config?.showEmptyString ? '' : 'N/A';
  }
  return data as T;
}

export function returnDataOrNull<T>(data: NullableType<T>): T | null {
  if (
    data === ''
    || data === null
    || data === undefined
    || ((typeof data === 'object') && (Object.keys(data).length === 0) && !Array.isArray(data))) {
    return null;
  }
  return data as T;
}


export function isEmpty<T>(value: T | null | undefined): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' || value instanceof String) {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return false; // For other types, consider them not empty by default
}

export function handleMultipleOptionalData(
  {
    values,
    spacer,
  }: {
    values: (NullableType<string>)[];
    spacer?: string;
  },
): string {
  const processed = values.map((item) => handleOptionalData(item));

  // Filter out empty and 'N/A'
  const validValues = processed.filter((val) => val !== 'N/A' && val !== '');

  if (validValues.length === 0) {
    return 'N/A';
  }

  // Otherwise, join the valid values with the spacer
  return validValues.join(spacer || ' ');
}

export function hasActiveFilters
  <T extends { page?: number }>(
    filters: T,
  ): boolean {
  const { page = 1, ...rest } = filters;

  // Pagination beyond page 1 counts as active
  if (page > 1) return true;

  // Check if any remaining filter is non-empty
  return Object.values(rest).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Boolean(value);
  });
}

export default handleOptionalData;
