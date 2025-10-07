/**
 * @file file-size implementation
 */

/**
 * File Size Formatting Utilities
 * Functions for formatting file sizes and bytes
 */

/**
 * Formats a file size from bytes into a human-readable string with appropriate units.
 *
 * @param bytes - The file size in bytes to format
 * @param precision - Number of decimal places to show (defaults to 1)
 * @returns A string representing the file size with units (e.g. "1.5 MB")
 *
 * @example
 * formatFileSize(1500) // Returns "1.5 KB"
 * formatFileSize(1500, 2) // Returns "1.46 KB"
 * formatFileSize(1500000) // Returns "1.4 MB"
 */
export function formatFileSize(bytes: number, precision: number = 1): string {
  // Handle edge cases
  if (typeof bytes !== "number" || !isFinite(bytes)) {
    return "0 B";
  }

  if (typeof precision !== "number" || !isFinite(precision) || precision < 0 || precision > 10) {
    precision = 1;
  }

  if (bytes === 0) return "0 B";

  // Handle extremely large numbers
  if (bytes > Number.MAX_SAFE_INTEGER) {
    return "> 1 PB";
  }

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let size = Math.abs(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Prevent precision issues with very small numbers
  if (size < 0.1 && unitIndex > 0) {
    size = Math.round(size * Math.pow(10, precision)) / Math.pow(10, precision);
  }

  const formatted = unitIndex === 0 ? Math.round(size).toString() : size.toFixed(precision);
  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Formats bytes into a human-readable string with appropriate units and custom precision.
 * This is an alias for formatFileSize for backward compatibility.
 *
 * @param bytes - The file size in bytes to format
 * @param precision - Number of decimal places to show (defaults to 1)
 * @returns A string representing the file size with units (e.g. "1.5 KB")
 *
 * @example
 * formatBytes(1500) // Returns "1.5 KB"
 * formatBytes(1500, 2) // Returns "1.46 KB"
 * formatBytes(1024, 0) // Returns "1 KB"
 */
export function formatBytes(bytes: number, precision: number = 1): string {
  return formatFileSize(bytes, precision);
}
