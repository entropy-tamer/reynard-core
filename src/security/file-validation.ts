/**
 * File Validation Utilities
 * File name and path validation functions
 */

// Removed unused import

/**
 * Check for path traversal patterns in filename
 */
function _checkPathTraversal(filename: string): boolean {
  const pathTraversalPatterns = [
    /\.\./g,
    /\.\.\//g,
    /\.\.\\/g,
    /\.\.%2f/gi,
    /\.\.%2F/gi,
    /\.\.%5c/gi,
    /\.\.%5C/gi,
    /\.\.%252f/gi,
    /\.\.%252F/gi,
    /\.\.%255c/gi,
    /\.\.%255C/gi,
  ];

  return pathTraversalPatterns.some(pattern => pattern.test(filename));
}

/**
 * Check if filename is a reserved Windows name
 */
function _isReservedName(filename: string): boolean {
  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ];

  const nameWithoutExt = filename.split(".")[0].toUpperCase();
  return reservedNames.includes(nameWithoutExt);
}

/**
 * Check if file extension is executable
 */
function _isExecutableExtension(filename: string): boolean {
  const executableExtensions = [
    "exe",
    "bat",
    "cmd",
    "com",
    "scr",
    "msi",
    "dll",
    "sys",
    "drv",
    "pif",
    "vbs",
    "jar",
    "app",
    "deb",
    "rpm",
    "sh",
    "ps1",
  ];

  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? executableExtensions.includes(extension) : false;
}

/**
 * Validate and sanitize file names
 * 🐺 FIXED: Enhanced file name validation with comprehensive path traversal prevention
 * *snarls with predatory glee* No more escaping my security!
 */
export function validateFileName(filename: string): {
  isValid: boolean;
  sanitized?: string;
} {
  if (!filename || typeof filename !== "string") {
    return { isValid: false };
  }

  // Check for null bytes and control characters first
  for (let i = 0; i < filename.length; i++) {
    const charCode = filename.charCodeAt(i);
    if (charCode < 32 || charCode === 127) {
      return { isValid: false };
    }
  }

  let sanitized = filename;

  // Check for hidden files first (before any sanitization)
  if (filename.startsWith(".")) {
    return { isValid: false };
  }

  // Check for path traversal attempts
  if (_checkPathTraversal(sanitized)) {
    return { isValid: false };
  }

  // Remove any remaining path separators
  sanitized = sanitized.replace(/[/\\]/g, "");

  // Check for reserved names (Windows)
  if (_isReservedName(sanitized)) {
    return { isValid: false };
  }

  // Check for executable file extensions
  if (_isExecutableExtension(sanitized)) {
    return { isValid: false };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(sanitized)) {
    return { isValid: false };
  }

  // Sanitize special characters (but preserve dots for extensions)
  sanitized = sanitized.replace(/[@#$%^&*()+=[\]{}|\\:";'<>?,]/g, "_");

  // Check length (Windows has 255 char limit for filename)
  if (sanitized.length > 255) {
    return { isValid: false };
  }

  // Check for empty filename
  if (sanitized.length === 0) {
    return { isValid: false };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate file extension
 */
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  if (!filename || !allowedExtensions || allowedExtensions.length === 0) {
    return false;
  }

  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Validate file type by extension (alias for validateFileExtension)
 */
export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  return validateFileExtension(filename, allowedTypes);
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize?: number): boolean {
  const defaultMaxSize = 10 * 1024 * 1024; // 10MB default
  const actualMaxSize = maxSize ?? defaultMaxSize;

  return size > 0 && size <= actualMaxSize;
}

/**
 * Validate file size with required max size (alias for validateFileSize)
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Get safe filename by removing dangerous characters
 */
export function getSafeFilename(filename: string): string {
  const result = validateFileName(filename);
  if (result.isValid && result.sanitized) {
    return result.sanitized;
  }

  // Fallback: create a safe filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `file_${timestamp}_${random}`;
}
