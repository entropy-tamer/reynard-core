/**
 * useViewportSize composable tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { useViewportSize } from "../../composables/useViewportSize";

describe("useViewportSize", () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 768,
      writable: true,
    });

    // Mock DOM methods
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create composable with required methods", () => {
    let viewportSize: ReturnType<typeof useViewportSize>;

    createRoot(() => {
      viewportSize = useViewportSize();
    });

    expect(viewportSize!.width).toBeDefined();
    expect(viewportSize!.height).toBeDefined();
    expect(viewportSize!.size).toBeDefined();
  });

  it("should provide width signal", () => {
    let viewportSize: ReturnType<typeof useViewportSize>;

    createRoot(() => {
      viewportSize = useViewportSize();
    });

    expect(typeof viewportSize!.width).toBe("function");
    expect(viewportSize!.width()).toBe(1024);
  });

  it("should provide height signal", () => {
    let viewportSize: ReturnType<typeof useViewportSize>;

    createRoot(() => {
      viewportSize = useViewportSize();
    });

    expect(typeof viewportSize!.height).toBe("function");
    expect(viewportSize!.height()).toBe(768);
  });

  it("should provide size signal", () => {
    let viewportSize: ReturnType<typeof useViewportSize>;

    createRoot(() => {
      viewportSize = useViewportSize();
    });

    expect(typeof viewportSize!.size).toBe("function");
    expect(viewportSize!.size()).toEqual({ width: 1024, height: 768 });
  });

  it("should handle different initial dimensions", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1920,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 1080,
      writable: true,
    });

    let viewportSize: ReturnType<typeof useViewportSize>;

    createRoot(() => {
      viewportSize = useViewportSize();
    });

    expect(viewportSize!.width()).toBe(1920);
    expect(viewportSize!.height()).toBe(1080);
    expect(viewportSize!.size()).toEqual({ width: 1920, height: 1080 });
  });
});
