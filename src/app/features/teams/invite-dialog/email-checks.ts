import { WorkspacePreferences } from '../../../core/models/workspace';
import { formatDayLabel, formatRelative } from '../../../shared/pipes/time-format';
import { IconName } from '../../../shared/ui/icon/icon-registry';
import { EmailRow } from './email-rows';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
const DOMAIN_SEPARATOR = /[\s,]+/;
const AT_PREFIX = /^@/;
const AGO_SUFFIX = /ago$/;
const LOWERCASE_RELATIVE_LABELS: ReadonlySet<string> = new Set(['Just now', 'Yesterday']);

export type EmailRowKind =
  'empty' | 'invalid' | 'duplicate' | 'member' | 'blocked' | 'pending' | 'ready';

export interface CheckedEmailRow extends EmailRow {
  readonly kind: EmailRowKind;
  readonly email: string;
  readonly invitedAt: number | null;
}

export interface EmailRules {
  readonly memberEmails: ReadonlySet<string>;
  readonly allowedDomains: readonly string[];
  readonly invitedAt: (email: string) => number | null;
}

export type RowMessageTone = 'error' | 'warning' | 'hint';

export interface RowMessage {
  readonly text: string;
  readonly icon: IconName;
  readonly tone: RowMessageTone;
}

export interface RowsSummary {
  readonly sendable: readonly CheckedEmailRow[];
  readonly skipped: readonly CheckedEmailRow[];
  readonly errors: readonly CheckedEmailRow[];
  readonly filled: readonly CheckedEmailRow[];
}

const ERROR_KINDS: ReadonlySet<EmailRowKind> = new Set(['invalid', 'duplicate', 'blocked']);
const SENDABLE_KINDS: ReadonlySet<EmailRowKind> = new Set(['ready', 'pending']);

export const allowedDomainsOf = (preferences: WorkspacePreferences | null): readonly string[] =>
  preferences?.restrictDomains
    ? preferences.domains
        .split(DOMAIN_SEPARATOR)
        .map((domain) => domain.replace(AT_PREFIX, '').toLowerCase())
        .filter(Boolean)
    : [];

const domainList = (domains: readonly string[]): string =>
  domains.map((domain) => `@${domain}`).join(', ');

export const domainPolicyOf = (domains: readonly string[]): string =>
  domains.length ? `Only ${domainList(domains)} addresses can be invited to this workspace.` : '';

const kindOf = (email: string, seen: Set<string>, rules: EmailRules): EmailRowKind => {
  const lower = email.toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return 'invalid';
  }
  if (seen.has(lower)) {
    return 'duplicate';
  }
  seen.add(lower);
  if (rules.memberEmails.has(lower)) {
    return 'member';
  }
  const domain = lower.split('@')[1] ?? '';
  if (rules.allowedDomains.length && !rules.allowedDomains.includes(domain)) {
    return 'blocked';
  }
  return rules.invitedAt(email) === null ? 'ready' : 'pending';
};

export const checkEmailRows = (
  rows: readonly EmailRow[],
  rules: EmailRules,
): readonly CheckedEmailRow[] => {
  const seen = new Set<string>();
  return rows.map((row) => {
    const email = row.value.trim();
    const kind = email ? kindOf(email, seen, rules) : 'empty';
    return { ...row, kind, email, invitedAt: kind === 'pending' ? rules.invitedAt(email) : null };
  });
};

export const summarizeRows = (rows: readonly CheckedEmailRow[]): RowsSummary => ({
  sendable: rows.filter((row) => SENDABLE_KINDS.has(row.kind)),
  skipped: rows.filter((row) => row.kind === 'member'),
  errors: rows.filter((row) => ERROR_KINDS.has(row.kind)),
  filled: rows.filter((row) => row.kind !== 'empty'),
});

export const invitedWhen = (invitedAt: number, now = Date.now()): string => {
  const relative = formatRelative(invitedAt, now);
  if (LOWERCASE_RELATIVE_LABELS.has(relative)) {
    return relative.toLowerCase();
  }
  return AGO_SUFFIX.test(relative) ? relative : `on ${formatDayLabel(invitedAt, now)}`;
};

const errorText = (row: CheckedEmailRow, domains: readonly string[]): string => {
  if (row.kind === 'blocked') {
    return `Only ${domainList(domains)} addresses can be invited.`;
  }
  return row.kind === 'duplicate'
    ? 'Already in the list.'
    : 'That doesn’t look like an email address.';
};

export const rowMessageOf = (
  row: CheckedEmailRow,
  showErrors: boolean,
  domains: readonly string[],
): RowMessage | null => {
  if (showErrors && ERROR_KINDS.has(row.kind)) {
    return { text: errorText(row, domains), icon: 'circle-alert', tone: 'error' };
  }
  switch (row.kind) {
    case 'blocked':
      return { text: 'Outside your approved domains.', icon: 'shield-alert', tone: 'warning' };
    case 'member':
      return {
        text: 'Already a member — this one will be skipped.',
        icon: 'user-check',
        tone: 'hint',
      };
    case 'pending':
      return {
        text: `Invited ${invitedWhen(row.invitedAt ?? Date.now())} — we’ll send it again.`,
        icon: 'history',
        tone: 'hint',
      };
    default:
      return null;
  }
};

export const inviteBannerOf = (summary: RowsSummary, workspaceName: string): string => {
  const errors = summary.errors.length;
  if (errors) {
    return errors === 1
      ? 'Fix the highlighted address to continue.'
      : `Fix the ${errors} highlighted addresses to continue.`;
  }
  if (!summary.filled.length) {
    return 'Add at least one email address.';
  }
  if (summary.sendable.length) {
    return '';
  }
  return summary.skipped.length === 1
    ? `That person is already a member of ${workspaceName}.`
    : `Everyone you added is already a member of ${workspaceName}.`;
};

const invitations = (count: number): string =>
  `${count} ${count === 1 ? 'invitation' : 'invitations'}`;

export const inviteCountLabel = (summary: RowsSummary): string => {
  const count = summary.sendable.length;
  if (!count) {
    return '';
  }
  const skipped = summary.skipped.length;
  return skipped ? `${invitations(count)} · ${skipped} skipped` : invitations(count);
};

export const submitLabelOf = (busy: boolean, count: number): string => {
  if (busy) {
    return 'Sending…';
  }
  return count > 1 ? `Send ${count} invitations` : 'Send invitation';
};
