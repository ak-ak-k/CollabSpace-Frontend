import { ActivityEvent } from '../../../core/models/activity';
import {
  AUDIT_CATEGORY_CHIPS,
  auditActorOptionsOf,
  auditEmptyCopyOf,
  auditRowOf,
  DEFAULT_AUDIT_FILTERS,
  filterAuditEvents,
  formatAuditTime,
  isAuditDateRange,
  isAuditFiltered,
} from './audit-log-view';

const NOW = new Date(2026, 9, 6, 12, 0).getTime();
const DAY = 86_400_000;

const auditEvent = (id: string, changes: Partial<ActivityEvent> = {}): ActivityEvent => ({
  id,
  workspaceId: 'w1',
  actorId: 'u0',
  verb: 'invited',
  object: 'sam@northstar.io',
  occurredAt: NOW,
  kind: 'invite',
  route: '',
  category: 'audit',
  entity: null,
  teamId: null,
  change: null,
  ...changes,
});

const names: Record<string, string> = { u0: 'Aarav Shah', u4: 'Kavya Reddy' };
const nameOf = (userId: string): string | null => names[userId] ?? null;

const events: readonly ActivityEvent[] = [
  auditEvent('invite'),
  auditEvent('role', { kind: 'role', actorId: 'u4', occurredAt: NOW - 3 * DAY }),
  auditEvent('github', { kind: 'integration', actorId: 'u4', occurredAt: NOW - 12 * DAY }),
  auditEvent('rename', { kind: 'workspace-settings', actorId: 'u9', occurredAt: NOW - 40 * DAY }),
];

const idsOf = (list: readonly ActivityEvent[]): string[] => list.map((event) => event.id);

describe('audit log view', () => {
  it('offers every category chip in design order', () => {
    expect(AUDIT_CATEGORY_CHIPS.map((chip) => chip.label)).toEqual([
      'All events',
      'Members',
      'Roles',
      'Permissions',
      'Workspace',
      'Security & integrations',
    ]);
  });

  it('filters by category group, person and date range together', () => {
    const filter = (changes: object) =>
      idsOf(filterAuditEvents(events, { ...DEFAULT_AUDIT_FILTERS, ...changes }, NOW));

    expect(filter({})).toEqual(['invite', 'role', 'github', 'rename']);
    expect(filter({ category: 'security' })).toEqual(['github']);
    expect(filter({ category: 'workspace' })).toEqual(['rename']);
    expect(filter({ actorId: 'u4' })).toEqual(['role', 'github']);
    expect(filter({ range: '7' })).toEqual(['invite', 'role']);
    expect(filter({ range: '30', actorId: 'u4', category: 'members' })).toEqual([]);
  });

  it('lists each known actor once, calling the current user You', () => {
    expect(auditActorOptionsOf(events, 'u0', nameOf)).toEqual([
      { value: '', label: 'Anyone' },
      { value: 'u0', label: 'You' },
      { value: 'u4', label: 'Kavya Reddy' },
    ]);
  });

  it('builds a row with an en-GB time, category label, summary and readable change', () => {
    const row = auditRowOf(
      auditEvent('role', {
        kind: 'role',
        verb: 'made',
        object: 'Nandini Rao an Admin',
        occurredAt: new Date(2026, 9, 5, 14, 32).getTime(),
        change: { from: 'Member', to: 'Admin' },
      }),
      'Kavya Reddy',
    );

    expect(row).toMatchObject({
      when: '5 Oct 2026, 14:32',
      who: 'Kavya Reddy',
      category: 'Roles',
      summary: 'made Nandini Rao an Admin',
      change: { from: 'Member', to: 'Admin', label: 'Changed from Member to Admin' },
    });
    expect(
      auditRowOf(auditEvent('logo', { verb: 'removed the logo', object: '' }), 'You'),
    ).toMatchObject({
      summary: 'removed the logo',
      change: null,
    });
    expect(formatAuditTime(new Date(2026, 0, 9, 7, 5).getTime())).toBe('9 Jan 2026, 07:05');
  });

  it('explains an empty log differently when filters are on', () => {
    expect(isAuditFiltered(DEFAULT_AUDIT_FILTERS)).toBe(false);
    expect(isAuditFiltered({ ...DEFAULT_AUDIT_FILTERS, range: '7' })).toBe(true);
    expect(auditEmptyCopyOf(true).heading).toBe('No events match these filters');
    expect(auditEmptyCopyOf(false).heading).toBe('No administrative events yet');
    expect(isAuditDateRange('30')).toBe(true);
    expect(isAuditDateRange('90')).toBe(false);
  });
});
