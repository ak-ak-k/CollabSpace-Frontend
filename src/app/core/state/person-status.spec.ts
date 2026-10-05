import { User } from '../models/user';
import { lastActiveAtOf, statusLineOf } from './person-status';

const NOW = new Date(2026, 9, 3, 15, 0).getTime();
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const person = (changes: Partial<User>): User => ({
  id: 'u1',
  name: 'Aditi Menon',
  title: 'Engineer',
  department: 'Engineering',
  email: 'aditi@northstar.io',
  status: 'offline',
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST · UTC+5:30',
  location: 'Kochi, India',
  role: 'member',
  ...changes,
});

describe('person status', () => {
  it('uses the presence label while someone is around', () => {
    expect(statusLineOf(person({ status: 'online' }), NOW)).toBe('Online');
    expect(statusLineOf(person({ status: 'dnd' }), NOW)).toBe('Do not disturb');
    expect(statusLineOf(person({ status: 'away' }), NOW)).toBe('Away');
  });

  it('says when an away or offline person was last active', () => {
    expect(statusLineOf(person({ status: 'away', lastActiveAt: NOW - 20 * 60_000 }), NOW)).toBe(
      'Away · active 20m ago',
    );
    expect(statusLineOf(person({ lastSeenAt: NOW - 2 * HOUR }), NOW)).toBe(
      'Offline · active 2h ago',
    );
    expect(statusLineOf(person({ lastSeenAt: NOW - DAY }), NOW)).toBe('Offline · active yesterday');
    expect(statusLineOf(person({}), NOW)).toBe('Offline');
  });

  it('treats online and do not disturb as active now', () => {
    expect(lastActiveAtOf(person({ status: 'dnd' }), NOW)).toBe(NOW);
    expect(lastActiveAtOf(person({ lastSeenAt: NOW - HOUR }), NOW)).toBe(NOW - HOUR);
    expect(lastActiveAtOf(person({}), NOW)).toBe(0);
  });
});
