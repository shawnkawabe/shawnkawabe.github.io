/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    // Pure derived-data modules must stay fully covered (BACKLOG P1-05).
    coverage: {
      provider: 'v8',
      include: ['src/lib/derive.ts', 'src/lib/format.ts', 'src/lib/filters.ts', 'src/lib/seo.ts'],
      thresholds: { lines: 100 },
    },
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
