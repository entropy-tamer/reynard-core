/**
 * Image Utils Types
 *
 * TypeScript interfaces for the backend image processing system.
 */

export interface ImageFormat {
  extension: string;
  mimeType: string;
  supported: boolean;
  requiresPlugin?: boolean;
}

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  mode: string;
  size: number;
}

export interface ImageTransform {
  resize?: { width: number; height: number };
  crop?: { x: number; y: number; width: number; height: number };
  normalize?: { mean: number[]; std: number[] };
  convert?: string;
}

export interface ImageProcessingServiceInfo {
  jxlSupported: boolean;
  avifSupported: boolean;
  supportedFormats: string[];
  totalFormats: number;
}

export interface ImageUtilsAPI {
  // Format support
  getSupportedFormats(): Promise<string[]>;
  isSupportedFormat(extension: string): Promise<boolean>;
  getFormatInfo(extension: string): Promise<ImageFormat | null>;
  requiresPlugin(extension: string): Promise<boolean>;

  // Image validation
  validateImagePath(filePath: string): Promise<boolean>;
  validateDimensions(width: number, height: number): Promise<boolean>;

  // Image processing
  getAspectRatio(width: number, height: number): Promise<number>;
  calculateResizeDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number
  ): Promise<{ width: number; height: number }>;

  // Service information
  getServiceInfo(): Promise<ImageProcessingServiceInfo>;
  isJxlSupported(): Promise<boolean>;
  isAvifSupported(): Promise<boolean>;
}
