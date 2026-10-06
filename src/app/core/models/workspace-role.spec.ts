import { canTransferOwnership, withTransferredOwnership } from './workspace-role';

describe('workspace role rules', () => {
  const roster = { me: 'owner', ana: 'admin', gus: 'guest' } as const;

  it('lets only an owner hand ownership to someone else in the workspace', () => {
    expect(canTransferOwnership(roster, 'ana', 'me')).toBe(true);
    expect(canTransferOwnership(roster, 'me', 'me')).toBe(false);
    expect(canTransferOwnership(roster, 'stranger', 'me')).toBe(false);
    expect(canTransferOwnership(roster, 'me', 'ana')).toBe(false);
  });

  it('makes the new owner an owner and the previous owner an admin', () => {
    expect(withTransferredOwnership(roster, 'ana', 'me')).toEqual({
      me: 'admin',
      ana: 'owner',
      gus: 'guest',
    });
  });
});
