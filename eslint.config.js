import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
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
    'src/lib/cn-tables.ts',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  // Also registers jsx-a11y with its recommended rules for every file, .tsx included.
  astro.configs['jsx-a11y-recommended'],
  {
    files: ['*.{js,mjs}', 'scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
]);
