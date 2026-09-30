import type { RadioOption } from '../../../../shared/ui/radio/radio-group.component';
import type { SelectOption } from '../../../../shared/ui/select/select.component';

export const TEAM_OPTIONS: readonly SelectOption[] = [
  { value: 'atlas', label: 'Atlas Web' },
  { value: 'platform', label: 'Data Platform' },
  { value: 'design', label: 'Design Systems' },
];

export const PRIORITY_OPTIONS: readonly RadioOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const LAYOUT_OPTIONS: readonly RadioOption[] = [
  { value: 'list', label: 'List', icon: 'list' },
  { value: 'grid', label: 'Grid', icon: 'layout-grid' },
];

export const PRIVACY_OPTIONS: readonly RadioOption[] = [
  {
    value: 'public',
    label: 'Public',
    icon: 'globe',
    description: 'Anyone in the workspace can find and join.',
  },
  {
    value: 'private',
    label: 'Private',
    icon: 'lock',
    description: 'Only invited people can see the team.',
  },
];

export const STATUS_OPTIONS: readonly RadioOption[] = [
  { value: 'online', label: 'Online', swatch: 'var(--success)' },
  { value: 'away', label: 'Away', swatch: 'var(--warning)' },
  { value: 'dnd', label: 'Do not disturb', swatch: 'var(--danger)' },
  { value: 'offline', label: 'Offline', swatch: 'var(--color-neutral-500)' },
];
