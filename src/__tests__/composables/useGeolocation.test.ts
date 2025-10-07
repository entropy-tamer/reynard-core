/**
 * @file Tests for composables
 */

/**
 * useGeolocation composable tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { useGeolocation } from "../../composables/useGeolocation";

describe("useGeolocation", () => {
  beforeEach(() => {
    // Mock navigator.geolocation
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create composable with required methods", () => {
    let geolocation: ReturnType<typeof useGeolocation>;

    createRoot(() => {
      geolocation = useGeolocation();
    });

    expect(geolocation!.position).toBeDefined();
    expect(geolocation!.error).toBeDefined();
    expect(geolocation!.isLoading).toBeDefined();
    expect(geolocation!.getCurrentPosition).toBeDefined();
    expect(geolocation!.watchPosition).toBeDefined();
    expect(geolocation!.stopWatching).toBeDefined();
  });

  it("should provide position signal", () => {
    let geolocation: ReturnType<typeof useGeolocation>;

    createRoot(() => {
      geolocation = useGeolocation();
    });

    expect(typeof geolocation!.position).toBe("function");
    expect(geolocation!.position()).toBe(null);
  });

  it("should provide error signal", () => {
    let geolocation: ReturnType<typeof useGeolocation>;

    createRoot(() => {
      geolocation = useGeolocation();
    });

    expect(typeof geolocation!.error).toBe("function");
    expect(geolocation!.error()).toBe(null);
  });

  it("should provide isLoading signal", () => {
    let geolocation: ReturnType<typeof useGeolocation>;

    createRoot(() => {
      geolocation = useGeolocation();
    });

    expect(typeof geolocation!.isLoading).toBe("function");
    expect(geolocation!.isLoading()).toBe(false);
  });

  it("should provide getCurrentPosition function", () => {
    let geolocation: ReturnType<typeof useGeolocation>;

    createRoot(() => {
      geolocation = useGeolocation();
    });

    expect(typeof geolocation!.getCurrentPosition).toBe("function");
  });

  it("should provide watchPosition function", () => {
    let geolocation: ReturnType<typeof useGeolocation>;

    createRoot(() => {
      geolocation = useGeolocation();
    });

    expect(typeof geolocation!.watchPosition).toBe("function");
  });

  it("should provide stopWatching function", () => {
    let geolocation: ReturnType<typeof useGeolocation>;

    createRoot(() => {
      geolocation = useGeolocation();
    });

    expect(typeof geolocation!.stopWatching).toBe("function");
  });
});
