import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    // No setup files to avoid the problematic setup
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
    },
  },
});
