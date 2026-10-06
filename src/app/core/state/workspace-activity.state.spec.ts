import { TestBed } from '@angular/core/testing';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { TeamMembershipState } from './team-membership.state';
import { WorkspaceActivityState } from './workspace-activity.state';
import { WorkspaceState } from './workspace.state';

describe('WorkspaceActivityState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [INSTANT_MOCK_DATA] });
  });

  const loaded = async (): Promise<WorkspaceActivityState> => {
    const activity = TestBed.inject(WorkspaceActivityState);
    await settle();
    return activity;
  };

  it('merges team, task and workspace events into one stream per workspace', async () => {
    const activity = await loaded();
    const ids = activity.events().map((event) => event.id);

    expect(ids).toContain('wa1');
    expect(ids).toContain('a1');
    expect(ids).toContain('th-NS-142-1');
    expect(ids).not.toContain('wa2');

    TestBed.inject(WorkspaceState).switchWorkspace('w2');

    expect(activity.events().map((event) => event.id)).toEqual(['wa11']);
    expect(activity.events({ category: 'audit' }).map((event) => event.id)).toEqual([
      'wa12',
      'wa13',
    ]);
  });

  it('files recorded events under activity or audit by kind unless told otherwise', async () => {
    const activity = await loaded();

    const team = activity.record({ kind: 'team', verb: 'created', object: 'Data', route: '' });
    const invite = activity.record({
      kind: 'invite',
      verb: 'invited',
      object: 'a@b.io',
      route: '',
    });
    const forced = activity.record({
      kind: 'team',
      verb: 'archived',
      object: 'Data',
      route: '',
      category: 'audit',
    });

    expect(activity.events()[0]).toMatchObject({ id: team, actorId: 'u0', category: 'activity' });
    const audit = activity.events({ category: 'audit' }).map((event) => event.id);
    expect(audit.slice(0, 2)).toEqual([forced, invite]);
  });

  it('lists a team’s activity and hides it once the team is archived', async () => {
    const activity = await loaded();

    const design = activity.events({ teamId: 't-design' });

    expect(design.length).toBeGreaterThan(0);
    expect(design.every((event) => event.teamId === 't-design')).toBe(true);

    await TestBed.inject(TeamMembershipState).setArchived('t-design', true);

    expect(activity.events({ teamId: 't-design' })).toEqual([]);
  });
});
