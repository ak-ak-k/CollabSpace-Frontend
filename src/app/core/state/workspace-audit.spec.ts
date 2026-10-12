import { BASE_WORKSPACE_PREFERENCES, MOCK_WORKSPACES } from '../mocks/workspaces.mock';
import {
  memberRemovedEntry,
  ownershipTransferEntry,
  roleChangeEntry,
  workspaceDeletionEntry,
  workspaceDetailsEntry,
} from './workspace-audit';
import { preferenceEntries, preferenceValueLabel } from './workspace-preference-audit';

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
      { requireTwoFactor: true, whoCanInvite: 'everyone', digest: 'weekly' },
    );

    expect(entries).toEqual([
      expect.objectContaining({
        kind: 'security',
        verb: 'changed',
        object: 'two-step verification',
        route: '/workspace/settings/security',
        action: 'security.setting_changed',
        meta: { setting: 'requireTwoFactor' },
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

  it('logs other workspace preferences as workspace settings with readable values', () => {
    const entries = preferenceEntries(
      BASE_WORKSPACE_PREFERENCES,
      { defaultRole: 'guest', notifyDefault: 'all', defaultTheme: 'dark', defaultChannelId: 'c-1' },
      (channelId) => (channelId === 'c-1' ? 'announcements' : null),
    );

    expect(entries.map((entry) => [entry.kind, entry.object, entry.route, entry.change])).toEqual([
      [
        'workspace-settings',
        'the default role for new members',
        '/workspace/settings/members',
        { from: 'Member', to: 'Guest' },
      ],
      [
        'workspace-settings',
        'default notifications for new members',
        '/workspace/settings/notifications',
        { from: 'Mentions and DMs', to: 'All new messages' },
      ],
      [
        'workspace-settings',
        'the default theme',
        '/workspace/settings/appearance',
        { from: 'Match system', to: 'Dark' },
      ],
      [
        'workspace-settings',
        'the default channel',
        '/workspace/settings/general',
        { from: 'None', to: '#announcements' },
      ],
    ]);
    expect(entries[0].action).toBe('workspace.setting_changed');
  });

  it('records the previous owner, the removed role and the deletion date', () => {
    expect(ownershipTransferEntry({ id: 'u4', name: 'Kavya Reddy' }, 'Aarav Shah')).toMatchObject({
      action: 'workspace.ownership_transferred',
      change: { from: 'Aarav Shah', to: 'Kavya Reddy' },
    });
    expect(memberRemovedEntry({ id: 'u4', name: 'Kavya Reddy' }, 'admin')).toMatchObject({
      action: 'member.removed',
      meta: { role: 'admin' },
    });
    expect(workspaceDeletionEntry(new Date(2026, 9, 26).getTime())).toMatchObject({
      action: 'workspace.deletion_scheduled',
      meta: { deleteOn: '26 October' },
    });
    expect(workspaceDeletionEntry(null)).toMatchObject({ meta: null });
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
