/**
 * @file Test setup for __tests__
 */

/**
 * MSW (Mock Service Worker) Setup for Comprehensive Request Interception
 *
 * This setup intercepts ALL HTTP requests regardless of when they're made,
 * including during module initialization.
 */

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// Create handlers that intercept all HTTP requests
const handlers = [
  // Intercept all HTTP requests to any URL
  http.all("*", () => {
    return HttpResponse.json(
      {
        status: "ok",
        message: "Mocked response",
        timestamp: Date.now(),
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }),
];

// Create and export the server
export const server = setupServer(...handlers);

// Setup and teardown functions
export const setupMSW = () => {
  server.listen({
    onUnhandledRequest: "warn",
  });
  console.log("🔧 MSW server started - all HTTP requests intercepted");
};

export const teardownMSW = () => {
  server.close();
  console.log("🔧 MSW server stopped");
};

// Auto-setup for tests
setupMSW();
