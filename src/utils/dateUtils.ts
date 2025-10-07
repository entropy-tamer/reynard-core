/**
 * @file dateUtils implementation
 */

/**
 * Date Utilities
 * Comprehensive date formatting and manipulation utilities
 */

/**
 * Formats a date as a relative time string (e.g., "2 hours ago", "3 days ago").
 *
 * @param date - The date to format (can be Date object or timestamp in milliseconds)
 * @returns A string representing the relative time
 *
 * @example
 * formatDistanceToNow(Date.now() - 3600000) // Returns "1 hour ago"
 * formatDistanceToNow(Date.now() - 86400000) // Returns "1 day ago"
 */
export function formatDistanceToNow(date: Date | number): string {
  const now = Date.now();
  const timestamp = typeof date === "number" ? date : date.getTime();
  const diff = now - timestamp;

  // Convert to seconds
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
  }

  // Convert to minutes
  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }

  // Convert to hours
  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }

  // Convert to days
  const days = Math.floor(hours / 24);

  if (days < 30) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  // Convert to months (approximate)
  const months = Math.floor(days / 30);

  if (months < 12) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  // Convert to years
  const years = Math.floor(months / 12);

  return years === 1 ? "1 year ago" : `${years} years ago`;
}

/**
 * Formats a date as a human-readable string with both relative and absolute time.
 *
 * @param date - The date to format
 * @returns A string with both relative and absolute time
 *
 * @example
 * formatDateWithAbsolute(new Date()) // Returns "just now (Dec 25, 2023 2:30 PM)"
 */
export function formatDateWithAbsolute(date: Date | number): string {
  const relative = formatDistanceToNow(date);
  const absolute = new Date(date).toLocaleString();
  return `${relative} (${absolute})`;
}

/**
 * Formats a duration in milliseconds as a human-readable string.
 *
 * @param duration - Duration in milliseconds
 * @returns A string representing the duration
 *
 * @example
 * formatDuration(3600000) // Returns "1h"
 * formatDuration(90000) // Returns "1m 30s"
 */
export function formatDuration(duration: number): string {
  const seconds = Math.floor(duration / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Gets the current date formatted as YYYY-MM-DD
 * @example
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Gets the current time formatted as HH:MM:SS
 * @example
 */
export function getCurrentTime(): string {
  return new Date().toTimeString().split(" ")[0];
}

/**
 * Checks if a date is today
 * @param date
 * @example
 */
export function isToday(date: Date | number): boolean {
  const today = new Date();
  const checkDate = typeof date === "number" ? new Date(date) : date;

  return checkDate.toDateString() === today.toDateString();
}

/**
 * Checks if a date is yesterday
 * @param date
 * @example
 */
export function isYesterday(date: Date | number): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = typeof date === "number" ? new Date(date) : date;

  return checkDate.toDateString() === yesterday.toDateString();
}

/**
 * Gets start of day for a given date
 * @param date
 * @example
 */
export function startOfDay(date: Date | number): Date {
  const d = typeof date === "number" ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Gets end of day for a given date
 * @param date
 * @example
 */
export function endOfDay(date: Date | number): Date {
  const d = typeof date === "number" ? new Date(date) : new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
