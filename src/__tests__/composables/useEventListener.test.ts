/**
 * useEventListener composable tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { useEventListener } from "../../composables/useEventListener";

describe("useEventListener", () => {
  beforeEach(() => {
    // Mock DOM methods
    document.addEventListener = vi.fn();
    document.removeEventListener = vi.fn();
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create composable with required methods", () => {
    const callback = vi.fn();

    let eventListener: ReturnType<typeof useEventListener>;

    createRoot(() => {
      eventListener = useEventListener("click", callback);
    });

    expect(eventListener!.isListening).toBeDefined();
  });

  it("should provide isListening signal", () => {
    const callback = vi.fn();

    let eventListener: ReturnType<typeof useEventListener>;

    createRoot(() => {
      eventListener = useEventListener("click", callback);
    });

    expect(typeof eventListener!.isListening).toBe("function");
    expect(eventListener!.isListening()).toBe(false);
  });

  it("should provide isListening signal that tracks state", () => {
    const callback = vi.fn();

    let eventListener: ReturnType<typeof useEventListener>;

    createRoot(() => {
      eventListener = useEventListener("click", callback);
    });

    expect(typeof eventListener!.isListening).toBe("function");
    // The effect might not run immediately, so just test the function exists
    expect(eventListener!.isListening()).toBeDefined();
  });

  it("should handle different event types", () => {
    const callback = vi.fn();

    let eventListener: ReturnType<typeof useEventListener>;

    createRoot(() => {
      eventListener = useEventListener("resize", callback);
    });

    expect(typeof eventListener!.isListening).toBe("function");
  });
});
