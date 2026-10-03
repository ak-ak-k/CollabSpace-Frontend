import { IconName } from '../../../shared/ui/icon/icon-registry';

export type WorkspaceSettingsSectionId =
  | 'general'
  | 'members'
  | 'roles'
  | 'notifications'
  | 'appearance'
  | 'security'
  | 'integrations'
  | 'danger';

export interface WorkspaceSettingsSection {
  readonly id: WorkspaceSettingsSectionId;
  readonly label: string;
  readonly icon: IconName;
  readonly description: string;
}

export const WORKSPACE_SETTINGS_URL = '/workspace/settings';
export const DEFAULT_WORKSPACE_SETTINGS_SECTION: WorkspaceSettingsSectionId = 'general';
export const OWNER_SECTION: WorkspaceSettingsSectionId = 'danger';

export const WORKSPACE_SETTINGS_SECTIONS: readonly WorkspaceSettingsSection[] = [
  {
    id: 'general',
    label: 'General',
    icon: 'building-2',
    description: 'Name, description, logo and address.',
  },
  {
    id: 'members',
    label: 'Members',
    icon: 'users',
    description: 'Who can invite people, and pending invitations.',
  },
  {
    id: 'roles',
    label: 'Roles & permissions',
    icon: 'key-round',
    description: 'What owners, admins, members and guests can do.',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'bell',
    description: 'Defaults for people who join this workspace.',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: 'palette',
    description: 'Default theme and density for new members.',
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'shield-check',
    description: 'Two-step verification, sign-in methods and sessions.',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: 'plug',
    description: 'Connect the tools your team already uses.',
  },
  {
    id: 'danger',
    label: 'Danger zone',
    icon: 'triangle-alert',
    description: 'Archive or delete this workspace.',
  },
];

export const workspaceSettingsSectionOf = (
  id: string | null | undefined,
): WorkspaceSettingsSection | null =>
  WORKSPACE_SETTINGS_SECTIONS.find((section) => section.id === id) ?? null;

export const workspaceSettingsLinkOf = (id: WorkspaceSettingsSectionId): string =>
  `${WORKSPACE_SETTINGS_URL}/${id}`;

export const resolveWorkspaceSettingsSection = (
  id: string | undefined,
  isMobile: boolean,
): WorkspaceSettingsSection | null =>
  workspaceSettingsSectionOf(id) ??
  (isMobile ? null : workspaceSettingsSectionOf(DEFAULT_WORKSPACE_SETTINGS_SECTION));

export const workspaceSettingsRedirectOf = (
  id: string | undefined,
  isMobile: boolean,
): string | null => {
  if (workspaceSettingsSectionOf(id)) {
    return null;
  }
  if (!isMobile) {
    return workspaceSettingsLinkOf(DEFAULT_WORKSPACE_SETTINGS_SECTION);
  }
  return id ? WORKSPACE_SETTINGS_URL : null;
};
