import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },

  { languageOptions: { globals: globals.browser } },

  js.configs.recommended,

  {
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@typescript-eslint": ts,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];