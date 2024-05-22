import globals from "globals";
import pluginJs from "@eslint/js";
import { FlatCompat } from '@eslint/eslintrc'
const compat = new FlatCompat()
export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        myCustomGlobal: "readonly"
      }
    }
  },
  pluginJs.configs.recommended,
  ...compat.extends('eslint-config-standard')
];