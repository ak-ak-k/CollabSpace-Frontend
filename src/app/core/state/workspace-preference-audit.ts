import { ActivityEntry } from '../models/activity';
import { WorkspacePreferences } from '../models/workspace';

type PreferenceKey = keyof WorkspacePreferences;
type PreferenceValue = WorkspacePreferences[PreferenceKey];
type PreferenceSection = 'security' | 'members' | 'notifications' | 'appearance' | 'general';

interface PreferenceAudit {
  readonly label: string;
  readonly section: PreferenceSection;
  readonly security: boolean;
}

export type ChannelNameOf = (channelId: string) => string | null;

const SETTINGS_ROUTE = '/workspace/settings';
const EMPTY_VALUE = '—';
const NO_CHANNEL = 'None';

const PREFERENCE_AUDIT: Record<PreferenceKey, PreferenceAudit> = {
  requireTwoFactor: { label: 'two-step verification', section: 'security', security: true },
  passwordSignIn: { label: 'email & password sign-in', section: 'security', security: true },
  googleSignIn: { label: 'Google sign-in', section: 'security', security: true },
  sessionLength: { label: 'session length', section: 'security', security: true },
  whoCanInvite: { label: 'who can invite people', section: 'members', security: true },
  restrictDomains: {
    label: 'approved-domains-only invites',
    section: 'members',
    security: true,
  },
  domains: { label: 'approved email domains', section: 'members', security: true },
  defaultRole: {
    label: 'the default role for new members',
    section: 'members',
    security: false,
  },
  notifyDefault: {
    label: 'default notifications for new members',
    section: 'notifications',
    security: false,
  },
  digest: { label: 'the email digest', section: 'notifications', security: false },
  allowEveryone: { label: '@everyone mentions', section: 'notifications', security: false },
  defaultTheme: { label: 'the default theme', section: 'appearance', security: false },
  defaultDensity: { label: 'the default density', section: 'appearance', security: false },
  defaultChannelId: { label: 'the default channel', section: 'general', security: false },
};

const PREFERENCE_KEYS = Object.keys(PREFERENCE_AUDIT) as PreferenceKey[];

const VALUE_LABELS: ReadonlyMap<string | boolean, string> = new Map<string | boolean, string>([
  [true, 'On'],
  [false, 'Off'],
  ['everyone', 'Everyone except guests'],
  ['admins', 'Owners and admins'],
  ['all', 'All new messages'],
  ['mentions', 'Mentions and DMs'],
  ['nothing', 'Nothing'],
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['system', 'Match system'],
  ['comfortable', 'Comfortable'],
  ['compact', 'Compact'],
  ['daily', 'Daily'],
  ['weekly', 'Weekly'],
  ['off', 'Off'],
  ['member', 'Member'],
  ['guest', 'Guest'],
]);

export const preferenceValueLabel = (value: string | boolean): string =>
  VALUE_LABELS.get(value) ?? (String(value) || EMPTY_VALUE);

const readableValue = (
  key: PreferenceKey,
  value: PreferenceValue | undefined,
  channelNameOf: ChannelNameOf,
): string => {
  if (key === 'defaultChannelId') {
    const name = typeof value === 'string' && value ? channelNameOf(value) : null;
    return name ? `#${name}` : NO_CHANNEL;
  }
  return preferenceValueLabel(value ?? '');
};

export const preferenceEntries = (
  previous: WorkspacePreferences | null,
  changes: Partial<WorkspacePreferences>,
  channelNameOf: ChannelNameOf = () => null,
): ActivityEntry[] =>
  PREFERENCE_KEYS.filter(
    (key) => changes[key] !== undefined && changes[key] !== previous?.[key],
  ).map((key) => {
    const { label, section, security } = PREFERENCE_AUDIT[key];
    return {
      kind: security ? 'security' : 'workspace-settings',
      verb: 'changed',
      object: label,
      route: `${SETTINGS_ROUTE}/${section}`,
      action: security ? 'security.setting_changed' : 'workspace.setting_changed',
      meta: { setting: key },
      change: {
        from: readableValue(key, previous?.[key], channelNameOf),
        to: readableValue(key, changes[key], channelNameOf),
      },
    };
  });
