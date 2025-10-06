/**
 * Security Module
 * Centralized security utilities and configurations for Reynard applications
 */

export * from "./headers";
export * from "./validation";
export * from "./file-validation";

// Export crypto utilities with explicit names to avoid conflicts
export {
  generateSecureBytes,
  generateSecureString as generateSecureCryptoString,
  generateSecureHex,
  generateSecureBase64,
  hashString,
  generateSecureUUID,
  constantTimeCompare,
  generateNonce as generateCryptoNonce,
  generateCSRFToken as generateCryptoCSRFToken,
  validateCSRFToken as validateCryptoCSRFToken,
  generateSessionID,
  generateAPIKey,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  secureRandomInt,
  generateSecurePassword,
} from "./crypto";

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  /** Enable HTTPS enforcement */
  enforceHTTPS: boolean;
  /** Enable CSP headers */
  enableCSP: boolean;
  /** Enable HSTS headers */
  enableHSTS: boolean;
  /** Enable XSS protection */
  enableXSSProtection: boolean;
  /** Enable content type sniffing protection */
  enableContentTypeProtection: boolean;
  /** Enable frame options */
  enableFrameOptions: boolean;
  /** Rate limiting configuration */
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  /** File upload security */
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
    scanForMalware: boolean;
  };
}

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enforceHTTPS: true,
  enableCSP: true,
  enableHSTS: true,
  enableXSSProtection: true,
  enableContentTypeProtection: true,
  enableFrameOptions: true,
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"],
    scanForMalware: false, // Would require backend integration
  },
};

/**
 * Development security configuration (more permissive)
 */
export const DEVELOPMENT_SECURITY_CONFIG: SecurityConfig = {
  ...DEFAULT_SECURITY_CONFIG,
  enforceHTTPS: false,
  rateLimit: {
    enabled: false,
    maxRequests: 1000,
    windowMs: 60000,
  },
  fileUpload: {
    maxSize: 50 * 1024 * 1024, // 50MB for development
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/json",
    ],
    scanForMalware: false,
  },
};

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig(environment: "development" | "production" = "production"): SecurityConfig {
  return environment === "development" ? DEVELOPMENT_SECURITY_CONFIG : DEFAULT_SECURITY_CONFIG;
}
