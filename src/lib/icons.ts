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

export type UiIconName = keyof typeof icons;
export type CloudIconName = keyof typeof cloudIcons;
export type IconName = UiIconName | CloudIconName;

export const isCloudIcon = (name: IconName): name is CloudIconName => name in cloudIcons;
