/**
 * SQL Validation Utilities
 * SQL injection prevention and input validation
 */

import { t as _t } from "../utils/optional-i18n";

/**
 * Validate SQL input to prevent injection attacks
 * 🐺 FIXED: Enhanced SQL injection prevention with comprehensive pattern detection
 * *snarls with predatory glee* No more SQL injection attempts!
 */
export function validateSQLInput(input: string): {
  isValid: boolean;
  sanitized?: string;
  warnings?: string[];
} {
  if (!input || typeof input !== "string") {
    return { isValid: false };
  }

  const warnings: string[] = [];
  let sanitized = input;

  // SQL injection patterns to detect (more specific patterns to avoid false positives)
  const sqlPatterns = [
    // Basic SQL keywords in context
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\s+/gi,

    // Comment patterns
    /--/g,
    /\/\*/g,
    /\*\//g,

    // Quote patterns in SQL context
    /'[^']*'/g,
    /"[^"]*"/g,
    /`[^`]*`/g,

    // Semicolon patterns
    /;/g,

    // OR/AND patterns
    /\bOR\s+1\s*=\s*1\b/gi,
    /\bAND\s+1\s*=\s*1\b/gi,
    /\bOR\s+true\b/gi,
    /\bAND\s+true\b/gi,

    // Time-based patterns
    /\bSLEEP\s*\(/gi,
    /\bWAITFOR\s+DELAY\b/gi,
    /\bBENCHMARK\s*\(/gi,

    // Information schema patterns
    /\binformation_schema\b/gi,
    /\bsys\./gi,
    /\bmaster\./gi,

    // Function patterns
    /\bCONCAT\s*\(/gi,
    /\bSUBSTRING\s*\(/gi,
    /\bCHAR\s*\(/gi,
    /\bASCII\s*\(/gi,
    /\bLENGTH\s*\(/gi,
    /\bCOUNT\s*\(/gi,

    // Union patterns
    /\bUNION\s+SELECT\b/gi,
    /\bUNION\s+ALL\s+SELECT\b/gi,

    // Stacked queries
    /\b;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/gi,
  ];

  // Check for dangerous patterns
  for (const pattern of sqlPatterns) {
    if (pattern.test(sanitized)) {
      warnings.push(`Potential SQL injection pattern detected: ${pattern.source}`);
    }
  }

  // Remove or escape dangerous characters
  sanitized = sanitized
    .replace(/['"`;]/g, "") // Remove quotes and semicolons
    .replace(/--.*$/gm, "") // Remove SQL comments
    .replace(/\/\*.*?\*\//gs, "") // Remove block comments
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b/gi, ""); // Remove SQL keywords

  // Check for remaining suspicious patterns
  const suspiciousPatterns = [
    /\bOR\b/gi,
    /\bAND\b/gi,
    /\bWHERE\b/gi,
    /\bFROM\b/gi,
    /\bJOIN\b/gi,
    /\bGROUP\s+BY\b/gi,
    /\bORDER\s+BY\b/gi,
    /\bHAVING\b/gi,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      warnings.push(`Suspicious SQL pattern detected: ${pattern.source}`);
    }
  }

  // If we have warnings, the input is potentially dangerous
  if (warnings.length > 0) {
    return {
      isValid: false,
      sanitized: sanitized.trim(),
      warnings,
    };
  }

  return {
    isValid: true,
    sanitized: sanitized.trim(),
  };
}

/**
 * Sanitize SQL input by escaping special characters
 */
export function sanitizeSQLInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/"/g, '""') // Escape double quotes
    .replace(/`/g, "``") // Escape backticks
    .replace(/;/g, "") // Remove semicolons
    .replace(/--/g, "") // Remove SQL comments
    .replace(/\/\*/g, "") // Remove block comment start
    .replace(/\*\//g, ""); // Remove block comment end
}

/**
 * Validate SQL identifier (table name, column name, etc.)
 */
export function validateSQLIdentifier(identifier: string): boolean {
  if (!identifier || typeof identifier !== "string") {
    return false;
  }

  // SQL identifiers should only contain letters, numbers, underscores, and start with letter or underscore
  const validIdentifierPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return validIdentifierPattern.test(identifier);
}

/**
 * Validate SQL parameter placeholder
 */
export function validateSQLParameter(param: string): boolean {
  if (!param || typeof param !== "string") {
    return false;
  }

  // Parameter placeholders should be simple identifiers
  return validateSQLIdentifier(param);
}
