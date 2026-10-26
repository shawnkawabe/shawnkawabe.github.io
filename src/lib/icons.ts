// Named UI icons (DESIGN §8). Components refer to icons by name so props stay serialisable.
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  House,
  Layers,
  Mail,
  Menu,
  Moon,
  Sun,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import github from '@/assets/icons/brands/github.svg';
import linkedin from '@/assets/icons/brands/linkedin.svg';
import commerceCloud from '@/assets/icons/clouds/commerce-cloud.svg';
import dataCloud from '@/assets/icons/clouds/data-cloud.svg';
import experienceCloud from '@/assets/icons/clouds/experience-cloud.svg';
import membership from '@/assets/icons/clouds/membership.svg';
import platform from '@/assets/icons/clouds/platform.svg';
import salesCloud from '@/assets/icons/clouds/sales-cloud.svg';
import serviceCloud from '@/assets/icons/clouds/service-cloud.svg';

export const icons = {
  home: House,
  work: BriefcaseBusiness,
  skills: Layers,
  about: User,
  contact: Mail,
  resume: FileText,
  external: ExternalLink,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  sun: Sun,
  moon: Moon,
  menu: Menu,
  close: X,
} satisfies Record<string, LucideIcon>;

// Original cloud artwork (DESIGN §8), keyed by the cloud's skill id in content/skills.json.
export const cloudIcons = {
  'sales-cloud': salesCloud,
  'service-cloud': serviceCloud,
  'experience-cloud': experienceCloud,
  'commerce-cloud': commerceCloud,
  'data-cloud': dataCloud,
  platform,
  membership,
};

// Lucide 1.x dropped brand icons; these are its former linkedin/github paths (ISC License).
export const brandIcons = { linkedin, github };

// Icons shipped as SVG files, rendered as Astro components (static, no React).
export const svgIcons = { ...cloudIcons, ...brandIcons };

export type UiIconName = keyof typeof icons;
export type CloudIconName = keyof typeof cloudIcons;
export type BrandIconName = keyof typeof brandIcons;
export type SvgIconName = keyof typeof svgIcons;
export type IconName = UiIconName | SvgIconName;

export const isSvgIcon = (name: IconName): name is SvgIconName => name in svgIcons;
