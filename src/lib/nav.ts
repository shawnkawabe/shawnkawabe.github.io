// Site navigation (SPEC §4.1): one source for the desktop rail and the mobile sheet.
import en from '@/i18n/en.json';
import type { IconName } from './icons';
import type { Site } from './schemas';

export type NavLink = { href: string; label: string; icon: IconName; external?: boolean };

export const pageLinks: NavLink[] = [
  { href: '/', label: en.nav.home, icon: 'home' },
  { href: '/work', label: en.nav.work, icon: 'work' },
  { href: '/skills', label: en.nav.skills, icon: 'skills' },
  { href: '/about', label: en.nav.about, icon: 'about' },
  { href: '/contact', label: en.nav.contact, icon: 'contact' },
];

export function externalLinks(site: Site): NavLink[] {
  return [
    { href: site.links.linkedin, label: en.nav.linkedin, icon: 'linkedin', external: true },
    { href: site.links.github, label: en.nav.github, icon: 'github', external: true },
    { href: site.links.resume, label: en.nav.resume, icon: 'resume', external: true },
  ];
}

/** Home matches only itself; other sections also match their sub-pages (/work/{id}). */
export function isActive(pathname: string, href: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (href === '/') return path === '/';
  return path === href || path.startsWith(`${href}/`);
}
