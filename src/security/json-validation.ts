/**
 * JSON Validation Utilities
 * JSON parsing and validation functions with security checks
 */

/**
 * Validate and parse JSON with security checks
 */
export function validateJSON(input: string): {
  isValid: boolean;
  parsed?: unknown;
  errors?: string[];
} {
  if (!input || typeof input !== "string") {
    return { isValid: false, errors: ["Input is required"] };
  }

  try {
    const parsed = JSON.parse(input);

    // Check for prototype pollution attempts
    if (typeof parsed === "object" && parsed !== null) {
      if ("__proto__" in parsed || "constructor" in parsed) {
        return { isValid: false, errors: ["Prototype pollution detected"] };
      }

      // Recursively check nested objects
      if (hasPrototypePollution(parsed)) {
        return { isValid: false, errors: ["Prototype pollution detected"] };
      }
    }

    return { isValid: true, parsed };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}

/**
 * Check for prototype pollution in nested objects
 */
function hasPrototypePollution(obj: Record<string, unknown>): boolean {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  for (const key in obj) {
    if (key === "__proto__" || key === "constructor") {
      return true;
    }

    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (hasPrototypePollution(obj[key] as Record<string, unknown>)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Sanitize JSON by removing dangerous properties
 */
export function sanitizeJSON(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  try {
    const parsed = JSON.parse(input);
    const sanitized = removeDangerousProperties(parsed);
    return JSON.stringify(sanitized);
  } catch {
    return input;
  }
}

/**
 * Remove dangerous properties from objects
 */
function removeDangerousProperties(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeDangerousProperties);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key !== "__proto__" && key !== "constructor") {
      result[key] = removeDangerousProperties(value);
    }
  }

  return result;
}
