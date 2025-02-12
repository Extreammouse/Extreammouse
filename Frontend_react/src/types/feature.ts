// types/feature.ts
import { LucideIcon } from 'lucide-react';

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  path?: string;
  onClick?: () => void;
  comingSoon?: boolean;
  requiresRecruiter?: boolean;
}