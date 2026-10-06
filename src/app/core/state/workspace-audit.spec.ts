import { BASE_WORKSPACE_PREFERENCES, MOCK_WORKSPACES } from '../mocks/workspaces.mock';
import {
  preferenceEntries,
  preferenceValueLabel,
  roleChangeEntry,
  workspaceDetailsEntry,
} from './workspace-audit';

const workspace = MOCK_WORKSPACES[0];

describe('workspace audit entries', () => {
  it('logs a rename with the old and new name, or a slug change as details', () => {
    expect(workspaceDetailsEntry(workspace, { name: 'Polaris' })).toMatchObject({
      kind: 'workspace-settings',
      verb: 'renamed the workspace',
      object: 'to Polaris',
      change: { from: workspace.name, to: 'Polaris' },
    });
    expect(workspaceDetailsEntry(workspace, { slug: 'polaris' })).toMatchObject({
      verb: 'updated workspace details',
      change: { from: workspace.slug, to: 'polaris' },
    });
    expect(workspaceDetailsEntry(workspace, { name: workspace.name })).toBeNull();
  });

  it('logs each changed security and invite preference with readable values', () => {
    const entries = preferenceEntries(
      { ...BASE_WORKSPACE_PREFERENCES, requireTwoFactor: false, whoCanInvite: 'admins' },
      { requireTwoFactor: true, whoCanInvite: 'everyone', digest: 'off' },
    );

    expect(entries).toEqual([
      expect.objectContaining({
        verb: 'changed',
        object: 'two-step verification',
        route: '/workspace/settings/security',
        change: { from: 'Off', to: 'On' },
      }),
      expect.objectContaining({
        object: 'who can invite people',
        route: '/workspace/settings/members',
        change: { from: 'Owners and admins', to: 'Everyone except guests' },
      }),
    ]);
    expect(preferenceValueLabel('')).toBe('—');
    expect(preferenceValueLabel('7 days')).toBe('7 days');
  });

  it('logs a role change against the member', () => {
    expect(roleChangeEntry({ id: 'u4', name: 'Nandini Rao' }, 'member', 'admin')).toMatchObject({
      kind: 'role',
      verb: 'made',
      object: 'Nandini Rao an Admin',
      entity: { type: 'member', id: 'u4' },
      change: { from: 'Member', to: 'Admin' },
    });
  });
});
