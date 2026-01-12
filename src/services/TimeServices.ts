import {
  endOfToday,
  endOfWeek,
  endOfYesterday,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';

import type { NullableType } from '@/types/GenericTypes';
import { returnDataOrNull } from '@/services/emptyDataServices';


// convert minute to milliseconds
export const convertMinToMilliSeconds = (minute: number): number => (1000 * 60 * minute);

export function generateLast100Years(): Array<number> {
  const currentYear = new Date().getFullYear();
  const years: Array<number> = [];

  for (let i = 0; i < 101; i += 1) { // 100 years back + 1 future year
    years.push(currentYear + 1 - i);
  }

  return years;
}

export function formatDate(
  dateString: Date | string,
  options?: Intl.DateTimeFormatOptions,
  fallback?: string,
): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return fallback || '';
  }

  // render date as it is for time not zoned
  if (typeof dateString === 'string' && !dateString.includes('Z')) {
    return dateString;
  }

  const defaultFormat: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  // Use 'en-CA' for ISO-like formatting (YYYY-MM-DD)
  const formattedDate = date.toLocaleDateString('en-CA', options || defaultFormat);

  return formattedDate;
}

export function addOneMonth(date: Date) {
  // Create a new date object to avoid mutating the original date
  const newDate = new Date(date.getTime());

  // Get the current month and year
  const month = newDate.getMonth();
  const year = newDate.getFullYear();

  // Set the new date to one month ahead
  newDate.setMonth(month + 1);

  // Handle year change if month is December
  if (newDate.getMonth() < month) {
    newDate.setFullYear(year + 1);
  }
  return newDate;
}

export function subtractOneMonth(date: Date) {
  // Create a new date object to avoid mutating the original date
  const newDate = new Date(date.getTime());

  // Get the current month and year
  const month = newDate.getMonth();
  const year = newDate.getFullYear();

  // Set the new date to one month prior
  newDate.setMonth(month - 1);

  // Handle year change if month is January
  if (newDate.getMonth() > month) {
    newDate.setFullYear(year - 1);
  }
  return newDate;
}

export function changeCalendarYear(date: Date, newYear: number): Date {
  const month = date.getMonth(); // getMonth returns 0-indexed month
  const day = date.getDate();
  return new Date(newYear, month, day);
}

export function formatUploadedDate(dateString: Date | string): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const date = new Date(dateString);

  // Get components of the date
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // Format hours for AM/PM
  // Convert 0 to 12 for midnight and adjust 24-hour time to 12-hour
  const formattedHours = hours % 12 || 12;
  const period = hours >= 12 ? 'pm' : 'am';

  return `${month} ${day}, ${year} at ${formattedHours}:${minutes} ${period}`;
}

export function isArrayCustomDate(dates: Array<string>): boolean {
  if (dates.length !== 2) {
    return false;
  }
  return dates.every((dateStr) => {
    const date = new Date(dateStr);
    return !Number.isNaN(date.getTime()); // Checks if the date is valid
  });
}

// returns two objects, filter_key_start, filter_key_end
export function convertDateToTimeRange<T extends string>(filterKey: T, dateRange: Array<string>) {
  if (!dateRange.length) {
    return null;
  }

  let startDate = '';
  let endDate = '';

  if (isArrayCustomDate(dateRange)) {
    startDate = (new Date(dateRange[0])).toISOString().slice(0, 10);
    endDate = (new Date(dateRange[1])).toISOString().slice(0, 10);
  } else {
    const currentDate = new Date();
    switch (dateRange[0]) {
      case 'Today':
        startDate = endOfToday().toISOString().slice(0, 10);
        endDate = endOfToday().toISOString().slice(0, 10);
        break;

      case 'Yesterday':
        startDate = endOfYesterday().toISOString().slice(0, 10);
        endDate = endOfYesterday().toISOString().slice(0, 10);
        break;

      case 'Last Week':
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString().slice(0, 10);
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString().slice(0, 10);
        break;

      case 'This Week':
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString().slice(0, 10);
        endDate = endOfToday().toISOString().slice(0, 10); // End date is today
        break;

      case 'This Month':
        startDate = startOfMonth(currentDate).toISOString().slice(0, 10);
        endDate = endOfToday().toISOString().slice(0, 10); // End date is today
        break;

      case 'This Year':
        startDate = startOfYear(currentDate).toISOString().slice(0, 10);
        endDate = endOfToday().toISOString().slice(0, 10); // End date is today
        break;
      default:
        throw new Error(`Unknown date range: ${dateRange[0]}`);
    }
  }

  return {
    [`${filterKey}_start`]: startDate,
    [`${filterKey}_end`]: endDate,
  } as {
      [K in `${T}_start` | `${T}_end`]: string;
    };
}

export function formatTimeToNoon(date: Date): string {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + 12);
  return newDate.toISOString();
}

export function formatToDateTime(isoString: string) {
  const date = new Date(isoString);

  // Get date parts in the user's local time zone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatDocumentDateString(input?: string): string {
  if (!input) {
    return 'invalid date';
  }
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return 'invalid date';
  }

  const month = `${date.toLocaleString('en-US', { month: 'short' })}.`;

  const day = date.getDate().toString().padStart(2, '0');

  const year = date.getFullYear();

  const time = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();

  return `${month} ${day}, ${year} at ${time}`;
}

export function formatDateToReadable(dateString: string): string {
  const date = new Date(dateString);

  // Get day with ordinal suffix
  const day = date.getDate();
  let daySuffix = 'th';
  if (day % 10 === 1 && day !== 11) daySuffix = 'st';
  else if (day % 10 === 2 && day !== 12) daySuffix = 'nd';
  else if (day % 10 === 3 && day !== 13) daySuffix = 'rd';

  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    year: 'numeric',
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
  return `${day}${daySuffix} ${formattedDate}`;
}

export function formatDateToReadableShort(dateString: string): string {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function isDateInPast(dateInput: Date | string): boolean {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }

  const now = new Date();
  return date.getTime() < now.getTime();
}

export function combineDateAndTime({
  dateInput,
  timeInput,
}: {
  dateInput: Date | string;
  timeInput: Date | string;
}): string {
  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const timeObj = typeof timeInput === 'string' ? new Date(timeInput) : timeInput;

  if (Number.isNaN(dateObj.getTime()) || Number.isNaN(timeObj.getTime())) {
    throw new Error('Invalid date or time provided');
  }

  // Extract date part
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  // Extract time part
  const hours = String(timeObj.getHours()).padStart(2, '0');
  const minutes = String(timeObj.getMinutes()).padStart(2, '0');
  const seconds = String(timeObj.getSeconds()).padStart(2, '0');

  // Combine to unified date string
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function formatToDateTimeString(
  dateString: string,
): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date string');

  const months = [
    'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.',
    'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.',
  ];

  const get = {
    month: () => months[date.getMonth()],
    day: () => String(date.getDate()).padStart(2, '0'),
    year: () => String(date.getFullYear()).slice(-2),
    hours24: () => (date.getHours()),
    minutes: () => (date.getMinutes()),
  };

  const monthName = get.month();
  const day = get.day();
  const year = get.year();

  let hour = get.hours24();
  const minute = get.minutes();

  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour %= 12;
  if (hour === 0) hour = 12;

  const hourStr = String(hour).padStart(2, '0');
  const minuteStr = String(minute).padStart(2, '0');

  return `${monthName} ${day}, ${year}, ${hourStr}:${minuteStr}${ampm}`;
}

export function extractLocalDateTime(
  value?: NullableType<string>,
): string | null {
  const dateValue = returnDataOrNull(value);
  if (!dateValue) return null;

  const dateObj = new Date(dateValue);
  if (Number.isNaN(dateObj.getTime())) return null;

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function combineLocalDateAndTime({
  dateString,
  startTimeString,
  endTimeString,
}: {
  dateString: string;
  startTimeString: NullableType<string>;
  endTimeString: NullableType<string>;
}): {
  startDateTime: NullableType<string>;
  endDateTime: NullableType<string>;
} {
  const combine = (
    dateStr: string,
    timeStr: NullableType<string>,
  ): NullableType<string> => {
    if (!dateStr || !timeStr) return null;

    const datePart = dateStr.split('T')[0];
    const timePart = timeStr.split('T')[1];

    if (!datePart || !timePart) return null;

    return `${datePart}T${timePart}`;
  };

  return {
    startDateTime: combine(dateString, startTimeString),
    endDateTime: combine(dateString, endTimeString),
  };
}

export interface TimeSlotParts {
  datePart: string;
  timePart: string;
}

export function formatTimeSlotToReadableString(
  startTime: string | Date,
  endTime: string | Date,
): TimeSlotParts {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formatTime = (d: Date): string => {
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes}${ampm}`;
  };

  const isSameDay = start.getFullYear() === end.getFullYear()
    && start.getMonth() === end.getMonth()
    && start.getDate() === end.getDate();

  // FULL FORMAT MODE
  if (isSameDay) {
    return {
      datePart: formatDate(start),
      timePart: `${formatTime(start)} - ${formatTime(end)}`,
    };
  }

  return {
    datePart: `${formatDate(start)} - ${formatDate(end)}`,
    timePart: `${formatTime(start)} - ${formatTime(end)}`,
  };
}

export function daysToResetDuration(days: number | null): string {
  if (days === null) return '1_month';
  if (days <= 1) return '1_day';
  if (days <= 7) return '7_days';
  if (days <= 14) return '2_weeks';
  return '1_month';
}

export function resetDurationToDays(duration: string): number {
  switch (duration) {
    case '12_hours': return 1;
    case '1_day': return 1;
    case '7_days': return 7;
    case '2_weeks': return 14;
    case '1_month': return 30;
    case '3_months': return 90;
    default: return 30;
  }
}

export function daysToRetentionDuration(days: number | null): string {
  if (days === null) return '1_month';
  if (days <= 7) return '7_days';
  if (days <= 14) return '2_weeks';
  if (days <= 30) return '1_month';
  return '3_months';
}

