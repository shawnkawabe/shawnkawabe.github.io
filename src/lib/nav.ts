// Site navigation (SPEC §4.1): one source for the desktop rail and the mobile sheet. Links point
// into the page's own locale (ADR 0003).
import type { IconName } from './icons';
import { localePath, splitLocale, strings, type Locale } from './i18n';
import type { Site } from './schemas';

export type NavLink = { href: string; label: string; icon: IconName; external?: boolean };

export function pageLinks(locale: Locale): NavLink[] {
  const { nav } = strings(locale);
  return [
    { href: localePath(locale, '/'), label: nav.home, icon: 'home' },
    { href: localePath(locale, '/work'), label: nav.work, icon: 'work' },
    { href: localePath(locale, '/skills'), label: nav.skills, icon: 'skills' },
    { href: localePath(locale, '/about'), label: nav.about, icon: 'about' },
    { href: localePath(locale, '/contact'), label: nav.contact, icon: 'contact' },
  ];
}

export function externalLinks(site: Site, locale: Locale): NavLink[] {
  const { nav } = strings(locale);
  return [
    { href: site.links.linkedin, label: nav.linkedin, icon: 'linkedin', external: true },
    { href: site.links.github, label: nav.github, icon: 'github', external: true },
    { href: site.links.resume, label: nav.resume, icon: 'resume', external: true },
  ];
}

/**
 * Home matches only itself; other sections also match their sub-pages (/work/{id}). The locale
 * prefix is ignored on both sides, so `/pt/work/brf/` is inside `/pt/work`.
 */
export function isActive(pathname: string, href: string): boolean {
  const normalize = (value: string) => splitLocale(value).path.replace(/\/+$/, '') || '/';
  const path = normalize(pathname);
  const target = normalize(href);
  if (target === '/') return path === '/';
  return path === target || path.startsWith(`${target}/`);
}
