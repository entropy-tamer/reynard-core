/**
 * @file Validation utilities for security
 */

/**
 * Security Validation Utilities
 * Main validation module that re-exports specialized validation functions
 */

// Re-export file validation functions
export { validateFileName, validateFileExtension, validateFileSize, getSafeFilename } from "./file-validation.js";

// Re-export SQL validation functions
export { validateSQLInput, sanitizeSQLInput, validateSQLIdentifier, validateSQLParameter } from "./sql-validation.js";

// Note: General input validation functions (validateURL, validateEmail, etc.)
// have been moved to the dedicated reynard-validation package

// Re-export URL validation from reynard-validation package
export { validateUrlSecurity as validateURL } from "@entropy-tamer/reynard-validation";

// Re-export JSON validation functions
export { validateJSON, sanitizeJSON } from "./json-validation.js";

// Re-export XSS validation functions
export { validateXSSInput, sanitizeXSSInput, validateHTMLContent } from "./xss-validation.js";

// Alias for backward compatibility
export { sanitizeXSSInput as sanitizeHTML } from "./xss-validation.js";

// Re-export MIME validation functions
export {
  validateMimeType,
  getMimeTypeFromExtension,
  validateFileTypeByExtension,
  isSafeMimeType,
  getFileCategory,
} from "./mime-validation.js";

// Legacy exports for backward compatibility
export { validateFileName as validateFilename } from "./file-validation.js";
export { validateSQLInput as validateSQL } from "./sql-validation.js";
