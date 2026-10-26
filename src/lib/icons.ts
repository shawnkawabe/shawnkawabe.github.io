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

export type IconName = keyof typeof icons;
