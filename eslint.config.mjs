import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";
import next from "@next/eslint-plugin-next";
import hooks from "eslint-plugin-react-hooks";
export default defineConfig([
  { ignores: [".next/**", "node_modules/**", "research-repositories/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ts.configs.recommended],
    plugins: { "@next/next": next, "react-hooks": hooks },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      ...hooks.configs.recommended.rules,
    },
  },
]);
