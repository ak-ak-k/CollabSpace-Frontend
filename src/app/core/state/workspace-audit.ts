import { ActivityChange, ActivityEntity, ActivityEntry } from '../models/activity';
import { ConfigurableRole, Permission, permissionLabelOf } from '../models/permission';
import { User, WorkspaceRole } from '../models/user';
import { Workspace, WorkspaceChanges, WorkspacePreferences } from '../models/workspace';
import { roleWithArticle, WORKSPACE_ROLE_LABELS } from '../models/workspace-role';

type AuditedMember = Pick<User, 'id' | 'name'>;

type AuditedPreference = keyof Pick<
  WorkspacePreferences,
  | 'requireTwoFactor'
  | 'passwordSignIn'
  | 'googleSignIn'
  | 'sessionLength'
  | 'whoCanInvite'
  | 'restrictDomains'
  | 'domains'
>;

const SETTINGS_ROUTE = '/workspace/settings';
const GENERAL_ROUTE = `${SETTINGS_ROUTE}/general`;
const DANGER_ROUTE = `${SETTINGS_ROUTE}/danger`;
const ROLES_ROUTE = `${SETTINGS_ROUTE}/roles`;
const MEMBERS_ROUTE = '/workspace/members';
const ADMINS_ROUTE = `${MEMBERS_ROUTE}/admins`;
const ALLOWED = 'Allowed';
const NOT_ALLOWED = 'Not allowed';
const WORKSPACE_OBJECT = 'the workspace';
const EMPTY_VALUE = '—';

const PREFERENCE_AUDIT: Record<AuditedPreference, { label: string; section: string }> = {
  requireTwoFactor: { label: 'two-step verification', section: 'security' },
  passwordSignIn: { label: 'email & password sign-in', section: 'security' },
  googleSignIn: { label: 'Google sign-in', section: 'security' },
  sessionLength: { label: 'session length', section: 'security' },
  whoCanInvite: { label: 'who can invite people', section: 'members' },
  restrictDomains: { label: 'approved-domains-only invites', section: 'members' },
  domains: { label: 'approved email domains', section: 'members' },
};

const AUDITED_PREFERENCES = Object.keys(PREFERENCE_AUDIT) as AuditedPreference[];

const VALUE_LABELS: ReadonlyMap<string | boolean, string> = new Map<string | boolean, string>([
  [true, 'On'],
  [false, 'Off'],
  ['everyone', 'Everyone except guests'],
  ['admins', 'Owners and admins'],
]);

export const preferenceValueLabel = (value: string | boolean): string =>
  VALUE_LABELS.get(value) ?? (String(value) || EMPTY_VALUE);

const memberEntity = (member: AuditedMember): ActivityEntity => ({ type: 'member', id: member.id });

export const workspaceDetailsEntry = (
  current: Workspace,
  changes: WorkspaceChanges,
): ActivityEntry | null => {
  const renamed = !!changes.name && changes.name !== current.name;
  const slugChanged = !!changes.slug && changes.slug !== current.slug;
  const describedChanged =
    changes.description !== undefined && changes.description !== current.description;
  if (!renamed && !slugChanged && !describedChanged) {
    return null;
  }
  return {
    kind: 'workspace-settings',
    verb: renamed ? 'renamed the workspace' : 'updated workspace details',
    object: renamed ? `to ${changes.name}` : '',
    route: GENERAL_ROUTE,
    change: renamed
      ? { from: current.name, to: changes.name ?? '' }
      : slugChanged
        ? { from: current.slug, to: changes.slug ?? '' }
        : null,
  };
};

export const workspaceLogoEntry = (logoUrl: string | null): ActivityEntry => ({
  kind: 'workspace-settings',
  verb: logoUrl ? 'changed the workspace logo' : 'removed the workspace logo',
  object: '',
  route: GENERAL_ROUTE,
});

export const workspaceArchiveEntry = (archived: boolean): ActivityEntry => ({
  kind: 'archive',
  verb: archived ? 'archived' : 'unarchived',
  object: WORKSPACE_OBJECT,
  route: DANGER_ROUTE,
});

export const workspaceDeletionEntry = (scheduled: boolean): ActivityEntry => ({
  kind: 'deletion',
  verb: scheduled ? 'scheduled deletion of' : 'cancelled deletion of',
  object: WORKSPACE_OBJECT,
  route: DANGER_ROUTE,
});

export const preferenceEntries = (
  previous: WorkspacePreferences | null,
  changes: Partial<WorkspacePreferences>,
): ActivityEntry[] =>
  AUDITED_PREFERENCES.filter(
    (key) => changes[key] !== undefined && changes[key] !== previous?.[key],
  ).map((key) => ({
    kind: 'security',
    verb: 'changed',
    object: PREFERENCE_AUDIT[key].label,
    route: `${SETTINGS_ROUTE}/${PREFERENCE_AUDIT[key].section}`,
    change: {
      from: preferenceValueLabel(previous?.[key] ?? ''),
      to: preferenceValueLabel(changes[key] ?? ''),
    },
  }));

export const roleChangeEntry = (
  member: AuditedMember,
  from: WorkspaceRole,
  to: WorkspaceRole,
): ActivityEntry => ({
  kind: 'role',
  verb: 'made',
  object: `${member.name} ${roleWithArticle(to)}`,
  route: MEMBERS_ROUTE,
  entity: memberEntity(member),
  change: { from: WORKSPACE_ROLE_LABELS[from], to: WORKSPACE_ROLE_LABELS[to] },
});

export const ownershipTransferEntry = (member: AuditedMember): ActivityEntry => ({
  kind: 'role',
  verb: 'transferred ownership to',
  object: member.name,
  route: ADMINS_ROUTE,
  entity: memberEntity(member),
});

export const memberRemovedEntry = (member: AuditedMember): ActivityEntry => ({
  kind: 'remove',
  verb: 'removed',
  object: member.name,
  route: MEMBERS_ROUTE,
  entity: memberEntity(member),
});

export const memberRestoredEntry = (member: AuditedMember): ActivityEntry => ({
  kind: 'remove',
  verb: 'restored',
  object: `${member.name} to the workspace`,
  route: MEMBERS_ROUTE,
  entity: memberEntity(member),
});

const permissionChangeOf = (allowed: boolean): ActivityChange =>
  allowed ? { from: NOT_ALLOWED, to: ALLOWED } : { from: ALLOWED, to: NOT_ALLOWED };

export const permissionChangeEntry = (
  permission: Permission,
  role: ConfigurableRole,
  allowed: boolean,
): ActivityEntry => ({
  kind: 'permission',
  verb: `turned ${allowed ? 'on' : 'off'} “${permissionLabelOf(permission)}” for`,
  object: `${WORKSPACE_ROLE_LABELS[role]}s`,
  route: ROLES_ROUTE,
  change: permissionChangeOf(allowed),
});
