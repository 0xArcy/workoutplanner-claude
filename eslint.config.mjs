import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This app's data hooks (useTemplates, useWorkoutLogs, etc.) fetch
      // from our own API routes on mount and store the result in state -
      // the textbook case for useEffect, even though the React Compiler's
      // stricter lint rules flag it. Not opting into those two rules.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma-generated client - not our code to lint.
    "app/generated/**",
  ]),
]);

export default eslintConfig;
