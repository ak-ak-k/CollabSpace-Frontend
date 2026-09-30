import type { LucideIconData } from '@lucide/angular';
import { ICON_NODES } from './icon-nodes/icon-nodes';

export type IconName = keyof typeof ICON_NODES;

export const ICON_NAMES = Object.keys(ICON_NODES) as IconName[];

const toIconData = (name: IconName): LucideIconData => ({ name, node: ICON_NODES[name] });

export const ICON_REGISTRY = Object.fromEntries(
  ICON_NAMES.map((name) => [name, toIconData(name)]),
) as Record<IconName, LucideIconData>;
