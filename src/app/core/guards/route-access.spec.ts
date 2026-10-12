import {
  canStartDirectConversation,
  channelBlockOf,
  conversationBlockOf,
  taskBlockOf,
  TeamFacts,
  teamBlockOf,
  workspaceSettingsBlockOf,
} from './route-access';

const settings = {
  section: 'general',
  workspaceName: 'Kite Ventures',
  isGuest: false,
  canViewAudit: true,
  canManage: true,
};

const team: TeamFacts = {
  id: 't-platform',
  name: 'Platform',
  memberIds: ['u0', 'u8'],
  isPrivate: false,
  archived: false,
};

const teamFacts = { team, me: 'u0', isGuest: false, workspaceName: 'Northstar Labs' };

describe('route access', () => {
  it('keeps guests out of workspace settings and members out of manager sections', () => {
    expect(workspaceSettingsBlockOf(settings)).toBeNull();
    expect(workspaceSettingsBlockOf({ ...settings, isGuest: true })?.context.title).toBe(
      'Workspace settings are for owners and admins',
    );
    expect(
      workspaceSettingsBlockOf({ ...settings, section: 'audit', canViewAudit: false })?.context.back
        .href,
    ).toBe('/workspace/settings/general');
    expect(
      workspaceSettingsBlockOf({ ...settings, section: 'danger', canManage: false })?.kind,
    ).toBe('denied');
    expect(workspaceSettingsBlockOf({ ...settings, canManage: false })).toBeNull();
  });

  it('hides missing and private teams and marks archived ones', () => {
    expect(teamBlockOf(teamFacts)).toBeNull();
    expect(teamBlockOf({ ...teamFacts, team: null })?.context.title).toBe('Team not found');
    expect(teamBlockOf({ ...teamFacts, me: 'u5', team: { ...team, isPrivate: true } })?.kind).toBe(
      'not-found',
    );
    expect(teamBlockOf({ ...teamFacts, me: 'u5', isGuest: true })?.kind).toBe('not-found');
    const archived = teamBlockOf({ ...teamFacts, team: { ...team, archived: true } });
    expect(archived?.context).toEqual(
      expect.objectContaining({ kicker: 'Archived', icon: 'archive', tone: 'neutral' }),
    );
  });

  it('denies private channels with an access request to the team lead', () => {
    const channel = { name: 'incidents', teamId: 't-platform', isPrivate: true, memberIds: ['u8'] };
    const blocked = channelBlockOf({ team, channel, me: 'u0', owner: 'Rohan Mehta' });
    expect(blocked?.kind).toBe('denied');
    expect(blocked?.context.request).toEqual({ owner: 'Rohan Mehta' });
    expect(blocked?.context.back).toEqual(
      expect.objectContaining({ label: 'Back to Platform', href: '/teams/t-platform' }),
    );
    expect(
      channelBlockOf({ team, channel: { ...channel, teamId: 't-design' }, me: 'u0', owner: '' })
        ?.context.title,
    ).toBe('Channel not found');
    expect(
      channelBlockOf({ team, channel: { ...channel, memberIds: ['u0'] }, me: 'u0', owner: '' }),
    ).toBeNull();
  });

  it('hides conversations and tasks the viewer can’t reach', () => {
    const group = {
      workspaceId: 'w1',
      id: 'g1',
      type: 'group',
      name: 'Launch',
      memberIds: ['u0'],
      createdBy: 'u0',
    } as const;
    const facts = { conversation: group, inWorkspace: true, left: false, me: 'u0' };
    expect(conversationBlockOf(facts)).toBeNull();
    expect(conversationBlockOf({ ...facts, left: true })?.context.title).toBe(
      'Conversation not found',
    );
    expect(conversationBlockOf({ ...facts, inWorkspace: false })?.kind).toBe('not-found');
    const guestReach = new Set(['u0', 'u8']);
    expect(canStartDirectConversation('dm-u8', guestReach)).toBe(true);
    expect(canStartDirectConversation('dm-u10', guestReach)).toBe(false);
    expect(canStartDirectConversation('g-launch', guestReach)).toBe(false);
    expect(taskBlockOf({ taskId: 'NS-999', task: null, team: null, me: 'u0' })?.context.body).toBe(
      'NS-999 may have been deleted, or it belongs to a team you can’t see.',
    );
    expect(
      taskBlockOf({
        taskId: 'NS-1',
        task: { teamId: 't-x' },
        team: { isPrivate: true, memberIds: [] },
        me: 'u0',
      }),
    ).not.toBeNull();
  });
});
