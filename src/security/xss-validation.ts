/**
 * @file Validation utilities for security
 */

/**
 * XSS Validation Utilities
 * Cross-site scripting prevention and validation functions
 */

/**
 * Validate input for XSS attacks
 * @param input
 * @example
 */
export function validateXSSInput(input: string): boolean {
  if (!input || typeof input !== "string") {
    return true; // Empty input is considered safe
  }

  // XSS patterns to detect
  const xssPatterns = [
    // Script tags
    /<script[^>]*>.*?<\/script>/gi,
    /<script[^>]*>/gi,

    // Event handlers
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /on\w+\s*=\s*[^>\s]+/gi,

    // JavaScript protocols
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,

    // Iframe and object tags
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,

    // Form elements
    /<form[^>]*>.*?<\/form>/gi,
    /<input[^>]*>/gi,
    /<button[^>]*>.*?<\/button>/gi,

    // Style tags with expressions
    /<style[^>]*>.*?<\/style>/gi,
    /expression\s*\(/gi,

    // Meta refresh
    /<meta[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/gi,

    // Link tags with javascript
    /<link[^>]*href\s*=\s*["']javascript:/gi,

    // Base64 encoded scripts
    /data:text\/html;base64,/gi,

    // SVG with scripts
    /<svg[^>]*>.*?<script.*?<\/script>.*?<\/svg>/gi,

    // CSS with expressions
    /expression\s*\(/gi,
    /url\s*\(\s*["']?javascript:/gi,
  ];

  // Check for XSS patterns
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  // Check for encoded XSS attempts
  const encodedPatterns = [
    /&#x3c;/gi, // <
    /&#60;/gi, // <
    /%3c/gi, // <
    /%3C/gi, // <
    /&#x3e;/gi, // >
    /&#62;/gi, // >
    /%3e/gi, // >
    /%3E/gi, // >
  ];

  for (const pattern of encodedPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitize input to prevent XSS
 * @param input
 * @example
 */
export function sanitizeXSSInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized = input;

  // Remove dangerous tags completely
  sanitized = sanitized
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<script[^>]*>/gi, "")
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<object[^>]*>.*?<\/object>/gi, "")
    .replace(/<embed[^>]*>.*?<\/embed>/gi, "")
    .replace(/<form[^>]*>.*?<\/form>/gi, "")
    .replace(/<input[^>]*>/gi, "")
    .replace(/<button[^>]*>.*?<\/button>/gi, "")
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<meta[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/gi, "")
    .replace(/<svg[^>]*>.*?<script.*?<\/script>.*?<\/svg>/gi, "");

  // Remove event handlers from remaining tags
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "").replace(/\s*on\w+\s*=\s*[^>\s]+/gi, "");

  // Clean up javascript: URLs in href and src attributes
  sanitized = sanitized
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href=""')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')
    .replace(/href\s*=\s*["']vbscript:[^"']*["']/gi, 'href=""')
    .replace(/src\s*=\s*["']vbscript:[^"']*["']/gi, 'src=""')
    .replace(/href\s*=\s*["']data:text\/html[^"']*["']/gi, 'href=""')
    .replace(/src\s*=\s*["']data:text\/html[^"']*["']/gi, 'src=""');

  // Remove remaining dangerous protocols
  sanitized = sanitized
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/data:text\/html;base64,/gi, "");

  // Remove CSS expressions
  sanitized = sanitized.replace(/expression\s*\(/gi, "").replace(/url\s*\(\s*["']?javascript:/gi, "");

  // Remove encoded dangerous characters
  sanitized = sanitized
    .replace(/&#x3c;/gi, "")
    .replace(/&#60;/gi, "")
    .replace(/%3c/gi, "")
    .replace(/%3C/gi, "")
    .replace(/&#x3e;/gi, "")
    .replace(/&#62;/gi, "")
    .replace(/%3e/gi, "")
    .replace(/%3E/gi, "");

  // Clean up extra spaces but preserve empty attributes with quotes
  sanitized = sanitized.replace(/\s+/g, " ").replace(/>\s+</g, "><").replace(/\s+>/g, ">").replace(/<\s+/g, "<");

  return sanitized;
}

/**
 * Validate HTML content for XSS
 * @param html
 * @example
 */
export function validateHTMLContent(html: string): {
  isValid: boolean;
  sanitized?: string;
  warnings?: string[];
} {
  if (!html || typeof html !== "string") {
    return { isValid: true, sanitized: "" };
  }

  const warnings: string[] = [];

  if (!validateXSSInput(html)) {
    warnings.push("Potential XSS content detected");
  }

  const sanitized = sanitizeXSSInput(html);

  return {
    isValid: warnings.length === 0,
    sanitized,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
