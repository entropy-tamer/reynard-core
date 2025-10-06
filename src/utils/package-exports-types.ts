/**
 * Type definitions for the Reynard Package Export System
 *
 * Defines the core interfaces, enums, and error classes used throughout
 * the package export system.
 */

export enum ExportType {
  MODULE = "module",
  COMPONENT = "component",
  FUNCTION = "function",
  CLASS = "class",
  CONSTANT = "constant",
}

export enum ExportValidationLevel {
  NONE = "none",
  BASIC = "basic",
  STRICT = "strict",
  COMPREHENSIVE = "comprehensive",
}

export interface ExportMetadata {
  packageName: string;
  exportType: ExportType;
  validationLevel: ExportValidationLevel;
  loadTime?: number;
  accessCount: number;
  lastAccess?: number;
  memoryUsage?: number;
  errorCount: number;
  lastError?: string;
  dependencies: string[];
  typeHints: Record<string, any>;
}

export class ExportValidationError extends Error {
  constructor(
    message: string,
    public packageName: string,
    public exportName?: string
  ) {
    super(`Export validation failed for ${packageName}: ${message}`);
  }
}
