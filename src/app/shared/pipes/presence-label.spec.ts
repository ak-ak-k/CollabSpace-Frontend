import { User } from '../../core/models/user';
import { presenceLabelOf } from './presence-label';

const NOW = new Date(2026, 8, 30, 12, 0).getTime();
const MINUTE = 60_000;

const user = (changes: Partial<User>): User => ({
  id: 'u9',
  name: 'Test Person',
  title: 'Tester',
  department: 'QA',
  email: 'test@example.com',
  status: 'online',
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST',
  location: 'Pune',
  role: 'member',
  ...changes,
});

describe('presenceLabelOf', () => {
  it('uses the presence label for people who are not offline', () => {
    expect(presenceLabelOf(user({ status: 'dnd' }), NOW)).toBe('Do not disturb');
  });

  it('describes when an offline person was last seen', () => {
    expect(presenceLabelOf(user({ status: 'offline', lastSeenAt: NOW - 5 * MINUTE }), NOW)).toBe(
      'Last seen 5m ago',
    );
    expect(presenceLabelOf(user({ status: 'offline', lastSeenAt: NOW }), NOW)).toBe(
      'Last seen just now',
    );
  });
});
