/**
 * Clipboard composable - manages clipboard operations
 * Provides reactive clipboard read/write functionality
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface UseClipboardOptions {
  /** Whether to track clipboard changes */
  enabled?: boolean;
  /** Callback when clipboard content changes */
  onClipboardChange?: (text: string) => void;
}

/**
 * Hook for managing clipboard operations
 */
export const useClipboard = (options: UseClipboardOptions = {}) => {
  const { enabled = true, onClipboardChange } = options;

  const [clipboardText, setClipboardText] = createSignal<string>("");
  const [isSupported, setIsSupported] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Check if clipboard API is supported
  createEffect(() => {
    const supported = "clipboard" in navigator && "writeText" in navigator.clipboard;
    setIsSupported(supported);
  });

  const writeText = async (text: string): Promise<boolean> => {
    if (!isSupported()) {
      setError("Clipboard API is not supported");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setClipboardText(text);
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to write to clipboard";
      setError(errorMessage);
      return false;
    }
  };

  const readText = async (): Promise<string | null> => {
    if (!isSupported()) {
      setError("Clipboard API is not supported");
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      setClipboardText(text);
      setError(null);
      onClipboardChange?.(text);
      return text;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to read from clipboard";
      setError(errorMessage);
      return null;
    }
  };

  const copy = async (text: string): Promise<boolean> => {
    return writeText(text);
  };

  const paste = async (): Promise<string | null> => {
    return readText();
  };

  // Listen for clipboard changes if enabled
  createEffect(() => {
    if (!enabled || !isSupported()) return;

    const handleClipboardChange = () => {
      readText();
    };

    // Note: clipboardchange event is not widely supported yet
    // This is a placeholder for future implementation
    document.addEventListener("clipboardchange", handleClipboardChange);

    onCleanup(() => {
      document.removeEventListener("clipboardchange", handleClipboardChange);
    });
  });

  return {
    clipboardText,
    isSupported,
    error,
    writeText,
    readText,
    copy,
    paste,
  };
};
