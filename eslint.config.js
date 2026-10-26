import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist/',
    '.astro/',
    'coverage/',
    'playwright-report/',
    'test-results/',
    '.lighthouseci/',
    'docs/claude-agent/',
    'src/styles/tokens.css',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs['jsx-a11y-recommended'],
  {
    files: ['**/*.{jsx,tsx}'],
    extends: [jsxA11y.flatConfigs.recommended],
  },
  {
    files: ['*.{js,mjs}', 'scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
]);
