/**
 * MIME Type Validation Utilities
 * MIME type validation and file type checking functions
 */

/**
 * Validate MIME type against allowed types
 */
export function validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
  if (!mimeType || typeof mimeType !== "string") {
    return false;
  }

  if (!allowedTypes || allowedTypes.length === 0) {
    return false;
  }

  return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string | null {
  if (!filename || typeof filename !== "string") {
    return null;
  }

  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension) {
    return null;
  }

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    ico: "image/x-icon",

    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Text
    txt: "text/plain",
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    xml: "application/xml",
    csv: "text/csv",

    // Archives
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",

    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",

    // Video
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    webm: "video/webm",
  };

  return mimeTypes[extension] || null;
}

/**
 * Validate file type by extension
 */
export function validateFileTypeByExtension(filename: string, allowedExtensions: string[]): boolean {
  if (!filename || typeof filename !== "string") {
    return false;
  }

  if (!allowedExtensions || allowedExtensions.length === 0) {
    return false;
  }

  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension) {
    return false;
  }

  return allowedExtensions.includes(extension);
}

/**
 * Check if MIME type is safe for upload
 */
export function isSafeMimeType(mimeType: string): boolean {
  if (!mimeType || typeof mimeType !== "string") {
    return false;
  }

  const dangerousTypes = [
    "application/x-executable",
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-winexe",
    "application/x-javascript",
    "text/javascript",
    "application/javascript",
    "text/html",
    "application/xhtml+xml",
  ];

  return !dangerousTypes.includes(mimeType.toLowerCase());
}

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimeType: string): string {
  if (!mimeType || typeof mimeType !== "string") {
    return "unknown";
  }

  const type = mimeType.toLowerCase();

  if (type.startsWith("image/")) {
    return "image";
  } else if (type.startsWith("video/")) {
    return "video";
  } else if (type.startsWith("audio/")) {
    return "audio";
  } else if (type.startsWith("text/")) {
    return "text";
  } else if (type.startsWith("application/")) {
    return "application";
  } else {
    return "unknown";
  }
}
