// Site languages (ADR 0003): every page lives under /{locale}/. Pure, so routing, the root
// redirect and the language switcher share one set of rules.
import en from '@/i18n/en.json';
import es from '@/i18n/es.json';
import locales from '@/i18n/locales.json';
import pt from '@/i18n/pt.json';

export const LOCALES = ['en', 'pt', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
/** localStorage key for the language switcher's choice, read by the root redirect. */
export const LOCALE_KEY = 'pf-locale';

export type LocaleInfo = { label: string; htmlLang: string; ogLocale: string; reviewed: boolean };
export const localeInfo: Record<Locale, LocaleInfo> = locales;

/** UI strings; every locale file must have exactly the keys of en.json (parity test). */
export type Strings = typeof en;
const allStrings: Record<Locale, Strings> = { en, pt, es };

export function strings(locale: Locale): Strings {
  return allStrings[locale];
}

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** The route's locale, or the default when there is none (404, dev pages, component tests). */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Locales that get pages. Drafts (not yet `reviewed` by Shawn) are built only in dev, or when
 * `INCLUDE_DRAFT_LOCALES` is set for a local check, so they never reach production.
 */
export function builtLocales(
  info: Record<Locale, LocaleInfo> = localeInfo,
  includeDrafts = false,
): Locale[] {
  return LOCALES.filter((locale) => includeDrafts || info[locale].reviewed);
}

/** `/work/brf` → `/pt/work/brf`; `/` → `/pt/`. Query and hash are kept. */
export function localePath(locale: Locale, path: string): string {
  return path === '/' ? `/${locale}/` : `/${locale}${path}`;
}

/** Splits `/pt/work/brf/` into its locale and the path inside it (`/work/brf/`). */
export function splitLocale(pathname: string): { locale: Locale | undefined; path: string } {
  const [, first, ...rest] = pathname.split('/');
  if (!isLocale(first)) return { locale: undefined, path: pathname };
  return { locale: first, path: `/${rest.join('/')}` };
}

/** The locale a URL belongs to (`/pt/work/` → `pt`); unprefixed pages (404) are English. */
export function localeFromPath(pathname: string): Locale {
  return toLocale(splitLocale(pathname).locale);
}

/** The same page in another language (language switcher, hreflang). */
export function switchLocalePath(pathname: string, locale: Locale): string {
  return localePath(locale, splitLocale(pathname).path);
}

export type Alternate = { locale: Locale; hreflang: string; path: string };

/** The page in every built language, for hreflang links and the language switcher. */
export function alternates(pathname: string, locales: readonly Locale[]): Alternate[] {
  return locales.map((locale) => ({
    locale,
    hreflang: localeInfo[locale].htmlLang,
    path: switchLocalePath(pathname, locale),
  }));
}

/** Remembers the visitor's language choice for the root redirect; ignores blocked storage. */
export function rememberLocale(
  locale: string,
  storage: () => Pick<Storage, 'setItem'> = () => localStorage,
): void {
  try {
    storage().setItem(LOCALE_KEY, locale);
  } catch {
    // Private mode or blocked storage: the choice simply is not remembered.
  }
}

/**
 * Root redirect choice: the stored switcher choice, else the first browser language whose base
 * (`pt-BR` → `pt`) has pages, else English.
 */
export function pickLocale(
  stored: string | null,
  browserLanguages: readonly string[],
  available: readonly Locale[],
): Locale {
  if (isLocale(stored) && available.includes(stored)) return stored;
  for (const language of browserLanguages) {
    const base = language.toLowerCase().split('-')[0];
    if (isLocale(base) && available.includes(base)) return base;
  }
  return DEFAULT_LOCALE;
}
