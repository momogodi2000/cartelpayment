import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-e2e/**",
    ".next-build-check/**",
    "test-results/**",
    "playwright-report/**",
    "public/sw.js",
    "coverage/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored reference material and one-off maintenance scripts —
    // not part of the app source.
    "docs/**",
    "messages/**",
    "fix_images.js",
  ]),
  {
    rules: {
      // Legitimate SSR-hydration guards and post-mount DOM measurement
      // (theme/locale from storage, `mounted` flags, scroll-edge state).
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "import/no-anonymous-default-export": "warn",
    },
  },
]);

export default eslintConfig;
