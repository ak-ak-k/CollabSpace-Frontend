import { User } from '../../core/models/user';
import {
  activeLabelOf,
  allowedMemberFilter,
  memberFilterChips,
  memberFilterOf,
  visibleMembers,
} from './members-view';
import { memberMenuItems } from './member-actions-view';

const NOW = new Date(2026, 9, 3, 15, 0).getTime();
const HOUR = 3_600_000;

const person = (id: string, name: string, changes: Partial<User> = {}): User => ({
  id,
  name,
  title: 'Engineer',
  department: 'Engineering',
  email: `${name.split(' ')[0].toLowerCase()}@northstar.io`,
  status: 'offline',
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST · UTC+5:30',
  location: 'Pune, India',
  role: 'member',
  ...changes,
});

const people: readonly User[] = [
  person('u2', 'Zoya Khan', { status: 'online', role: 'admin' }),
  person('u1', 'Aditi Menon', { department: 'Design' }),
  person('u3', 'Clara Mendes', { role: 'guest' }),
];

describe('members view', () => {
  it('falls back to all members for unknown filters', () => {
    expect(memberFilterOf('guests')).toBe('guests');
    expect(memberFilterOf('nobody')).toBe('all');
    expect(memberFilterOf(undefined)).toBe('all');
    expect(memberFilterOf('invited')).toBe('invited');
  });

  it('adds the Invited chip only for people who can invite', () => {
    expect(memberFilterChips(people).map((chip) => chip.filter)).not.toContain('invited');
    expect(memberFilterChips(people, 2).at(-1)).toEqual({
      filter: 'invited',
      label: 'Invited',
      link: '/workspace/members/invited',
      count: 2,
    });
    expect(allowedMemberFilter('invited', false)).toBe('all');
    expect(allowedMemberFilter('invited', true)).toBe('invited');
  });

  it('counts each filter and sorts matches by name', () => {
    expect(memberFilterChips(people).map((chip) => chip.count)).toEqual([3, 1, 1, 1, 1]);
    expect(visibleMembers(people, 'all', '').map((user) => user.name)).toEqual([
      'Aditi Menon',
      'Clara Mendes',
      'Zoya Khan',
    ]);
    expect(visibleMembers(people, 'all', 'design').map((user) => user.id)).toEqual(['u1']);
  });

  it('describes when a member was last active', () => {
    expect(activeLabelOf(person('u4', 'Dev', { status: 'dnd' }), NOW)).toBe('Active now');
    expect(activeLabelOf(person('u4', 'Dev', { lastSeenAt: NOW - 2 * HOUR }), NOW)).toBe(
      'Active 2h ago',
    );
    expect(activeLabelOf(person('u4', 'Dev', { status: 'away' }), NOW)).toBe('Away');
    expect(activeLabelOf(person('u4', 'Dev'), NOW)).toBe('Not active yet');
  });

  it('offers management actions only when the viewer may change the member', () => {
    const kinds = (canChange: boolean, isMe: boolean) =>
      memberMenuItems({ isMe, firstName: 'Aditi' }, canChange).map((item) => item.kind);

    expect(kinds(false, true)).toEqual(['profile', 'edit-profile']);
    expect(kinds(true, false)).toEqual(['profile', 'message', 'role', 'remove']);
  });
});
