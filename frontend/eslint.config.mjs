import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
  ignores: ['dist/**', '.trash-nextjs/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
  files: ['**/*.{js,jsx}'],
  languageOptions: {
  ecmaVersion: 'latest',
  sourceType: 'module',
  globals: { ...globals.browser, ...globals.es2021 },
  parserOptions: {
  ecmaFeatures: { jsx: true },
  },
  },
  settings: { react: { version: 'detect' } },
  plugins: {
  react,
  'react-hooks': reactHooks,
  'react-refresh': reactRefresh,
  },
  rules: {
  ...react.configs.flat.recommended.rules,
  ...reactHooks.configs.recommended.rules,
  // React 19 + the new JSX transform: no need to import React in scope
  'react/react-in-jsx-scope': 'off',
  'react/prop-types': 'off',
  'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
  },
];
