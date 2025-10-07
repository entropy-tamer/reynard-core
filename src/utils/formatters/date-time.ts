/**
 * @file date-time implementation
 */

/**
 * Date and Time Formatting Utilities
 * Functions for formatting dates and times
 */

/**
 * Formats a date/time value into a human-readable string.
 *
 * @param date - The date to format (Date object, timestamp, or ISO string)
 * @returns A string representing the formatted date/time
 *
 * @example
 * formatDateTime(new Date()) // Returns "2024-01-01 12:00:00"
 * formatDateTime(1704067200000) // Returns "2024-01-01 12:00:00"
 */
export function formatDateTime(date: Date | number | string): string {
  // Handle null/undefined input
  if (date == null) {
    return "Invalid Date";
  }

  let dateObj: Date;

  if (typeof date === "number") {
    // Validate timestamp
    if (!isFinite(date) || date < 0) {
      return "Invalid Date";
    }
    dateObj = new Date(date);
  } else if (typeof date === "string") {
    // Validate string input
    if (date.trim() === "") {
      return "Invalid Date";
    }
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return "Invalid Date";
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  return dateObj.toISOString().replace("T", " ").substring(0, 19);
}
