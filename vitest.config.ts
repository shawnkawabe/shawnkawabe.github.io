/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    // Logic modules in src/lib must stay fully covered (BACKLOG P1-05).
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/derive.ts',
        'src/lib/format.ts',
        'src/lib/filters.ts',
        'src/lib/seo.ts',
        'src/lib/nav.ts',
        'src/lib/theme.ts',
        'src/lib/mobile-nav.ts',
        'src/lib/focus-trap.ts',
        'src/lib/lightbox.ts',
        'src/lib/case-study.ts',
        'src/lib/contact.ts',
        'src/lib/constellation.ts',
        'src/lib/motion.ts',
        'src/lib/i18n.ts',
        'src/lib/data-core.ts',
        'src/lib/tilt.ts',
        'src/lib/idle.ts',
      ],
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
