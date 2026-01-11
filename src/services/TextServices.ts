import { titleCase } from 'title-case';


// Title case strings containing special delimiter
export function titleCaseSpecialDelimiter(str: string, delimiter: string) {
  return titleCase(
    str,
    { wordSeparators: new Set([delimiter]) },
  ).replace(new RegExp(`\\${delimiter}`, 'g'), ' ');
}

// Title case strings separated by underscore or dash
export function titleCaseUnderscoreDash(str: string) {
  return titleCase(
    str,
    { wordSeparators: new Set(['_', '-']) },
  ).replace(/_/g, ' ').replace(/-/g, ' ');
}

export function capitalizeFirstLetter(input: string): string {
  // handle when string is empty
  if (!input) return '';

  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

export function truncateStringByLength(text: string, chunkSize: number): string {
  if (text.length > chunkSize) {
    return `${text.slice(0, chunkSize)}...`;
  }
  return text;
}



/**
 * Performs a deep comparison between two values to determine if they are equivalent.
 *
 * @param a - The first value to compare
 * @param b - The second value to compare
 * @returns True if the values are deeply equal, false otherwise
 */

export function isDeepEqual<T>(a: T, b: T): boolean {
  // Direct memory equality check
  if (a === b) {
    return true;
  }

  // Handle NaN
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) {
      return true;
    }
    return Math.abs(a - b) < Number.EPSILON;
  }

  // Handle string to number comparison (e.g., "78" and 78)
  if ((typeof a === 'string' && typeof b === 'number')
    || (typeof a === 'number' && typeof b === 'string')) {
    const numA = Number(a);
    const numB = Number(b);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      return Math.abs(numA - numB) < Number.EPSILON;
    }
    return false;
  }

  // Handle null, undefined, or non-objects
  if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle RegExp objects
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => isDeepEqual(item, b[index]));
  }

  // Handle different constructors
  if (a.constructor !== b.constructor) {
    return false;
  }

  // Handle objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every((key) => {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    // @ts-expect-error - We know that these properties exist
    return isDeepEqual(a[key], b[key]);
  });
}

