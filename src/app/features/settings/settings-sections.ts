import { IconName } from '../../shared/ui/icon/icon-registry';

export type SettingsGroup = 'Personal' | 'Workspace';

export type SettingsSectionId =
  'account' | 'profile' | 'notifications' | 'appearance' | 'privacy' | 'security';

export interface SettingsSection {
  readonly id: SettingsSectionId;
  readonly group: SettingsGroup;
  readonly label: string;
  readonly icon: IconName;
  readonly description: string;
}

export interface SettingsNavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly link: string;
}

export interface SettingsGroupView {
  readonly label: SettingsGroup;
  readonly items: readonly SettingsNavItem[];
}

export const SETTINGS_URL = '/settings';
export const DEFAULT_SETTINGS_SECTION: SettingsSectionId = 'account';
export const WORKSPACE_SETTINGS_LINK = '/workspace/settings/general';

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    id: 'account',
    group: 'Personal',
    label: 'Account',
    icon: 'user',
    description: 'Your email, password and account controls.',
  },
  {
    id: 'profile',
    group: 'Personal',
    label: 'Profile',
    icon: 'badge-check',
    description: 'How you appear to people in this workspace.',
  },
  {
    id: 'notifications',
    group: 'Personal',
    label: 'Notifications',
    icon: 'bell',
    description: 'Choose what reaches you, and where.',
  },
  {
    id: 'appearance',
    group: 'Personal',
    label: 'Appearance',
    icon: 'palette',
    description: 'Theme and density across every device.',
  },
  {
    id: 'privacy',
    group: 'Personal',
    label: 'Privacy',
    icon: 'eye',
    description: 'Control what others can see about your activity.',
  },
  {
    id: 'security',
    group: 'Personal',
    label: 'Security',
    icon: 'shield-check',
    description: 'Two-step verification and active sessions.',
  },
];

export const WORKSPACE_SETTINGS_ITEM: SettingsNavItem = {
  id: 'workspace',
  label: 'Workspace settings',
  icon: 'building-2',
  link: WORKSPACE_SETTINGS_LINK,
};

export const settingsLinkOf = (id: SettingsSectionId): string => `${SETTINGS_URL}/${id}`;

export const SETTINGS_GROUP_VIEWS: readonly SettingsGroupView[] = [
  {
    label: 'Personal',
    items: SETTINGS_SECTIONS.map(({ id, label, icon }) => ({
      id,
      label,
      icon,
      link: settingsLinkOf(id),
    })),
  },
  { label: 'Workspace', items: [WORKSPACE_SETTINGS_ITEM] },
];

export const MOVED_SETTINGS_REDIRECTS: Readonly<Record<string, string>> = {
  workspace: WORKSPACE_SETTINGS_LINK,
  members: '/workspace/members',
  roles: '/workspace/settings/roles',
  integrations: '/workspace/settings/integrations',
};

export const settingsSectionOf = (id: string | null | undefined): SettingsSection | null =>
  SETTINGS_SECTIONS.find((section) => section.id === id) ?? null;

export const resolveSettingsSection = (
  id: string | undefined,
  isMobile: boolean,
): SettingsSection | null =>
  settingsSectionOf(id) ?? (isMobile ? null : settingsSectionOf(DEFAULT_SETTINGS_SECTION));

export const settingsRedirectOf = (id: string | undefined, isMobile: boolean): string | null => {
  if (settingsSectionOf(id)) {
    return null;
  }
  if (!isMobile) {
    return settingsLinkOf(DEFAULT_SETTINGS_SECTION);
  }
  return id ? SETTINGS_URL : null;
};

export const settingsTitleOf = (id: string | null): string => {
  const section = settingsSectionOf(id);
  return section ? `${section.label} settings · CollabSpace` : 'Settings · CollabSpace';
};
