import { User } from '../../../core/models/user';
import {
  inviteExpiryOf,
  LOGO_TYPE_ERROR,
  logoFileErrorOf,
  parseDomains,
  readOnlyNoteOf,
  transferCandidatesOf,
} from './workspace-settings-view';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 3, 12);

describe('workspace settings view', () => {
  it('counts down the 7-day invitation expiry', () => {
    expect(inviteExpiryOf(NOW, NOW)).toBe('Expires in 7 days');
    expect(inviteExpiryOf(NOW - 6 * DAY, NOW)).toBe('Expires tomorrow');
    expect(inviteExpiryOf(NOW - 7 * DAY, NOW)).toBe('Expired');
  });

  it('cleans approved domains', () => {
    expect(parseDomains(' @Northstar.io, northstar.dev;kite.vc  ')).toEqual([
      'northstar.io',
      'northstar.dev',
      'kite.vc',
    ]);
    expect(parseDomains(' , ; ')).toEqual([]);
  });

  it('rejects logos that are not images or are too large', () => {
    expect(logoFileErrorOf('application/pdf', 10)).toBe(LOGO_TYPE_ERROR);
    expect(logoFileErrorOf('image/png', 3 * 1_048_576)).toBe(
      'That image is 3.0 MB — logos must be 2 MB or smaller',
    );
    expect(logoFileErrorOf('image/svg+xml', 1024)).toBe('');
  });

  it('explains why members and guests cannot edit', () => {
    expect(readOnlyNoteOf('guest', 'Kite Ventures')).toBe(
      'You’re a guest of Kite Ventures. Only owners and admins can change these settings — you can still view them.',
    );
  });

  it('offers every non-guest member except you as the new owner, by name', () => {
    const members: readonly Pick<User, 'id' | 'name' | 'role'>[] = [
      { id: 'me', name: 'Aditi', role: 'owner' },
      { id: 'zoe', name: 'Zoe', role: 'admin' },
      { id: 'gus', name: 'Gus', role: 'guest' },
      { id: 'ben', name: 'Ben', role: 'member' },
    ];

    expect(transferCandidatesOf(members, 'me')).toEqual([
      { value: 'ben', label: 'Ben · Member' },
      { value: 'zoe', label: 'Zoe · Admin' },
    ]);
  });
});
