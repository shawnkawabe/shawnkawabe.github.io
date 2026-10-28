import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  alternates,
  builtLocales,
  DEFAULT_LOCALE,
  isLocale,
  localeFromPath,
  localeInfo,
  localePath,
  LOCALE_KEY,
  LOCALES,
  pickLocale,
  rememberLocale,
  splitLocale,
  strings,
  switchLocalePath,
  toLocale,
} from '@/lib/i18n';

describe('locale guards', () => {
  it('accepts only the site locales and defaults to English', () => {
    expect(isLocale('pt')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(toLocale('es')).toBe('es');
    expect(toLocale('fr')).toBe(DEFAULT_LOCALE);
  });
});

describe('builtLocales', () => {
  const info = {
    en: { label: 'English', htmlLang: 'en', ogLocale: 'en_US', reviewed: true },
    pt: { label: 'Português', htmlLang: 'pt-BR', ogLocale: 'pt_BR', reviewed: true },
    es: { label: 'Español', htmlLang: 'es-419', ogLocale: 'es_LA', reviewed: false },
  };

  it('builds reviewed locales, and drafts only on request', () => {
    expect(builtLocales(info)).toEqual(['en', 'pt']);
    expect(builtLocales(info, true)).toEqual(['en', 'pt', 'es']);
  });

  it('always builds the default locale', () => {
    expect(builtLocales()).toContain(DEFAULT_LOCALE);
  });
});

describe('locale paths', () => {
  it('prefixes paths, with a trailing slash for the locale home', () => {
    expect(localePath('pt', '/')).toBe('/pt/');
    expect(localePath('pt', '/work?cloud=x')).toBe('/pt/work?cloud=x');
  });

  it('splits a prefixed path and leaves an unprefixed one alone', () => {
    expect(splitLocale('/pt/work/brf/')).toEqual({ locale: 'pt', path: '/work/brf/' });
    expect(splitLocale('/es/')).toEqual({ locale: 'es', path: '/' });
    expect(splitLocale('/404')).toEqual({ locale: undefined, path: '/404' });
  });

  it('reads the locale of a URL, English when unprefixed', () => {
    expect(localeFromPath('/es/about/')).toBe('es');
    expect(localeFromPath('/404')).toBe('en');
  });

  it('switches the same page to another language', () => {
    expect(switchLocalePath('/en/work/brf/', 'pt')).toBe('/pt/work/brf/');
    expect(switchLocalePath('/es/', 'en')).toBe('/en/');
  });
});

describe('pickLocale (root redirect)', () => {
  const all = ['en', 'pt', 'es'] as const;

  it('prefers a stored choice that has pages', () => {
    expect(pickLocale('es', ['pt-BR'], all)).toBe('es');
    expect(pickLocale('es', ['pt-BR'], ['en', 'pt'])).toBe('pt');
  });

  it('falls back to the first browser language with pages, by base tag', () => {
    expect(pickLocale(null, ['fr-FR', 'PT-br', 'es'], all)).toBe('pt');
    expect(pickLocale('xx', ['es-MX'], all)).toBe('es');
  });

  it('ends at English', () => {
    expect(pickLocale(null, ['fr', 'de'], all)).toBe('en');
    expect(pickLocale(null, [], ['en'])).toBe('en');
  });
});

// P4-02 parity: every locale carries the same UI keys and the same content entries.
function keys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function ids(file: unknown): string[] {
  return Array.isArray(file) ? file.map((entry: { id: string }) => entry.id) : keys(file);
}

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));

describe('translation parity (P4-02)', () => {
  it('has locale metadata for every locale, English reviewed', () => {
    expect(Object.keys(localeInfo).sort()).toEqual([...LOCALES].sort());
    expect(localeInfo.en.reviewed).toBe(true);
  });

  it.each(LOCALES)('%s UI strings have exactly the English keys', (locale) => {
    expect(keys(strings(locale)).sort()).toEqual(keys(strings('en')).sort());
  });

  const files = readdirSync(join('content', 'en')).filter((name) => name.endsWith('.json'));

  it.each(LOCALES)('content/%s has the English files and entry ids, in order', (locale) => {
    expect(readdirSync(join('content', locale)).filter((name) => name.endsWith('.json'))).toEqual(
      files,
    );
    for (const name of files) {
      expect(ids(readJson(join('content', locale, name))), name).toEqual(
        ids(readJson(join('content', 'en', name))),
      );
    }
  });

  // keys() collapses an array to its key name, so the check above sees that `productIndex` exists
  // but not what is in it. These are skill ids, never translated prose, so they must match exactly
  // or Home shows a different list per language (L-47).
  it.each(LOCALES)('content/%s site.productIndex matches English exactly', (locale) => {
    const productIndex = (file: unknown) => (file as { productIndex: string[] }).productIndex;
    expect(productIndex(readJson(join('content', locale, 'site.json')))).toEqual(
      productIndex(readJson(join('content', 'en', 'site.json'))),
    );
  });
});

describe('alternates', () => {
  it('lists the page in each given locale with its hreflang', () => {
    expect(alternates('/en/work/brf/', ['en', 'pt'])).toEqual([
      { locale: 'en', hreflang: 'en', path: '/en/work/brf/' },
      { locale: 'pt', hreflang: 'pt-BR', path: '/pt/work/brf/' },
    ]);
  });
});

describe('rememberLocale', () => {
  it('stores the choice under the shared key', () => {
    const stored = new Map<string, string>();
    rememberLocale('pt', () => ({ setItem: (key, value) => void stored.set(key, value) }));
    expect(stored.get(LOCALE_KEY)).toBe('pt');
  });

  it('uses localStorage by default', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { setItem });
    rememberLocale('es');
    vi.unstubAllGlobals();
    expect(setItem).toHaveBeenCalledWith(LOCALE_KEY, 'es');
  });

  it('survives blocked storage', () => {
    const blocked = () => {
      throw new Error('blocked');
    };
    expect(() => rememberLocale('pt', blocked)).not.toThrow();
  });
});
