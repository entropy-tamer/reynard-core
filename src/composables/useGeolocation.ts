/**
 * Geolocation composable - tracks user's geographic location
 * Provides reactive location data with error handling
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface CustomGeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface UseGeolocationOptions {
  /** Whether to track location */
  enabled?: boolean;
  /** Whether to watch position continuously */
  watch?: boolean;
  /** Position options */
  options?: PositionOptions;
  /** Callback when position changes */
  onPositionChange?: (position: CustomGeolocationPosition) => void;
  /** Callback when error occurs */
  onError?: (error: GeolocationPositionError) => void;
}

/**
 * Hook for tracking geolocation
 */
export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const {
    enabled = true,
    watch = false,
    options: positionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    },
    onPositionChange,
    onError,
  } = options;

  const [position, setPosition] = createSignal<CustomGeolocationPosition | null>(null);
  const [error, setError] = createSignal<GeolocationPositionError | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  let watchId: number | null = null;

  const handleSuccess = (pos: globalThis.GeolocationPosition) => {
    const positionData: CustomGeolocationPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude ?? undefined,
      altitudeAccuracy: pos.coords.altitudeAccuracy ?? undefined,
      heading: pos.coords.heading ?? undefined,
      speed: pos.coords.speed ?? undefined,
      timestamp: pos.timestamp,
    };

    setPosition(positionData);
    setError(null);
    setIsLoading(false);
    onPositionChange?.(positionData);
  };

  const handleError = (err: GeolocationPositionError) => {
    setError(err);
    setPosition(null);
    setIsLoading(false);
    onError?.(err);
  };

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      const error = new Error("Geolocation is not supported by this browser") as any;
      error.code = 1; // PERMISSION_DENIED
      error.message = "Geolocation is not supported by this browser";
      handleError(error);
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, positionOptions);
  };

  const watchPosition = () => {
    if (!navigator.geolocation) {
      const error = new Error("Geolocation is not supported by this browser") as any;
      error.code = 1; // PERMISSION_DENIED
      error.message = "Geolocation is not supported by this browser";
      handleError(error);
      return;
    }

    setIsLoading(true);
    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, positionOptions);
  };

  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  };

  createEffect(() => {
    if (!enabled) {
      stopWatching();
      return;
    }

    if (watch) {
      watchPosition();
    } else {
      getCurrentPosition();
    }

    onCleanup(() => {
      stopWatching();
    });
  });

  return {
    position,
    error,
    isLoading,
    getCurrentPosition,
    watchPosition,
    stopWatching,
  };
};
