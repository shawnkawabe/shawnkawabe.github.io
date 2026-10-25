/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.ts'],
          exclude: ['tests/unit/islands/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'islands',
          environment: 'jsdom',
          include: ['tests/unit/islands/**/*.test.{ts,tsx}'],
          setupFiles: ['tests/setup-dom.ts'],
        },
      },
    ],
  },
});
