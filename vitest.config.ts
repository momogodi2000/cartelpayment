import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "src/lib/translations.ts",
        "src/__tests__/**",
        "vitest.config.ts",
        "next.config.js",
        "tailwind.config.ts",
        "postcss.config.js",
        "node_modules/**"
      ],
      thresholds: {
        branches: 85,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
