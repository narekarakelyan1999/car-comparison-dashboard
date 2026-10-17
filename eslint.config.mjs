import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const importGroups = [
  ["^\\u0000"],
  ["^react(\\u0000)?$", "^react-dom", "^react/", "^next"],
  ["^@?\\w"],
  ["^@/shared(?:/|$)"],
  ["^@/features(?:/|$)"],
  ["^@/config(?:/|$)"],
  ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
  ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
  ["^.+\\.s?css$"],
];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": ["error", { groups: importGroups }],
      "simple-import-sort/exports": "error",
      "no-nested-ternary": "error",
      "no-unneeded-ternary": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  prettier,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "coverage/**",
    "next-env.d.ts",
    "out/**",
    "build/**",
  ]),
]);
