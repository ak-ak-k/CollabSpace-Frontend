import { routeTargetOf } from './route-target';

describe('routeTargetOf', () => {
  it('reads workspace settings sections', () => {
    expect(routeTargetOf('/workspace/settings/audit')).toEqual({
      kind: 'workspace-settings',
      section: 'audit',
    });
    expect(routeTargetOf('/workspace/settings')).toEqual({
      kind: 'workspace-settings',
      section: null,
    });
    expect(routeTargetOf('/workspace/members')).toEqual({ kind: 'open' });
  });

  it('reads teams, team tabs and channels', () => {
    expect(routeTargetOf('/teams/t-frontend/members')).toEqual({
      kind: 'team',
      teamId: 't-frontend',
      channelId: null,
    });
    expect(routeTargetOf('/teams/t-frontend/channels/c-releases/thread/m1')).toEqual({
      kind: 'team',
      teamId: 't-frontend',
      channelId: 'c-releases',
    });
    expect(routeTargetOf('/teams')).toEqual({ kind: 'open' });
  });

  it('reads conversations but not saved messages', () => {
    expect(routeTargetOf('/messages/dm-u1/m/42')).toEqual({
      kind: 'conversation',
      conversationId: 'dm-u1',
    });
    expect(routeTargetOf('/messages/saved')).toEqual({ kind: 'open' });
  });

  it('reads tasks from the path or the task query parameter', () => {
    expect(routeTargetOf('/tasks/NS-142?view=list')).toEqual({ kind: 'task', taskId: 'NS-142' });
    expect(routeTargetOf('/tasks?task=NS-7')).toEqual({ kind: 'task', taskId: 'NS-7' });
    expect(routeTargetOf('/tasks?view=list')).toEqual({ kind: 'open' });
  });
});
