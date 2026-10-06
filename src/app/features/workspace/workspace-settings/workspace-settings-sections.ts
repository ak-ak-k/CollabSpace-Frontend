import { Permission } from '../../../core/models/permission';
import { IconName } from '../../../shared/ui/icon/icon-registry';

export type WorkspaceSettingsSectionId =
  | 'general'
  | 'members'
  | 'roles'
  | 'notifications'
  | 'appearance'
  | 'security'
  | 'integrations'
  | 'audit'
  | 'danger';

export interface WorkspaceSettingsSection {
  readonly id: WorkspaceSettingsSectionId;
  readonly label: string;
  readonly icon: IconName;
  readonly description: string;
  readonly requires: readonly Permission[];
}

export type PermissionCheck = (permission: Permission) => boolean;

export const WORKSPACE_SETTINGS_URL = '/workspace/settings';
export const DEFAULT_WORKSPACE_SETTINGS_SECTION: WorkspaceSettingsSectionId = 'general';
export const OWNER_SECTION: WorkspaceSettingsSectionId = 'danger';
export const AUDIT_SECTION: WorkspaceSettingsSectionId = 'audit';

const OPEN: readonly Permission[] = [];
const MANAGERS_ONLY: readonly Permission[] = ['workspace.manage'];
const AUDITORS_ONLY: readonly Permission[] = ['workspace.manage', 'audit.view'];

export const WORKSPACE_SETTINGS_SECTIONS: readonly WorkspaceSettingsSection[] = [
  {
    id: 'general',
    label: 'General',
    icon: 'building-2',
    description: 'Name, description, logo and address.',
    requires: OPEN,
  },
  {
    id: 'members',
    label: 'Members',
    icon: 'users',
    description: 'Who can invite people, and pending invitations.',
    requires: OPEN,
  },
  {
    id: 'roles',
    label: 'Roles & permissions',
    icon: 'key-round',
    description: 'What owners, admins, members and guests can do.',
    requires: OPEN,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'bell',
    description: 'Defaults for people who join this workspace.',
    requires: OPEN,
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: 'palette',
    description: 'Default theme and density for new members.',
    requires: OPEN,
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'shield-check',
    description: 'Two-step verification, sign-in methods and sessions.',
    requires: MANAGERS_ONLY,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: 'plug',
    description: 'Connect the tools your team already uses.',
    requires: MANAGERS_ONLY,
  },
  {
    id: 'audit',
    label: 'Audit log',
    icon: 'scroll-text',
    description: 'Administrative and security changes. Entries can’t be edited or deleted.',
    requires: AUDITORS_ONLY,
  },
  {
    id: 'danger',
    label: 'Danger zone',
    icon: 'triangle-alert',
    description: 'Archive or delete this workspace.',
    requires: MANAGERS_ONLY,
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

export const sectionAllowed = (section: WorkspaceSettingsSection, can: PermissionCheck): boolean =>
  section.requires.every(can);

export const visibleWorkspaceSettingsSections = (
  can: PermissionCheck,
): readonly WorkspaceSettingsSection[] =>
  WORKSPACE_SETTINGS_SECTIONS.filter((section) => sectionAllowed(section, can));

export const canOpenWorkspaceSettings = (
  id: string | null,
  isGuest: boolean,
  can: PermissionCheck,
): boolean => {
  const section = workspaceSettingsSectionOf(id);
  return !isGuest && (!section || sectionAllowed(section, can));
};
