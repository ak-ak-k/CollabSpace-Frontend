import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivityRow } from '../../../core/state/activity-row';
import { ActivityFeedComponent } from './activity-feed.component';

const NOW = Date.now();

const row = (id: string, changes: Partial<ActivityRow> = {}): ActivityRow => ({
  id,
  kind: 'task',
  action: 'task.status_changed',
  occurredAt: NOW,
  actor: {
    name: 'Rahul Mehta',
    shortName: 'Rahul',
    avatarName: 'Rahul Mehta',
    avatarText: '',
    seed: 2,
    link: '/profile/u2',
    label: 'View profile of Rahul Mehta',
  },
  verb: 'moved',
  object: 'NS-142 to Review',
  route: '/tasks?task=NS-142',
  change: { from: 'In progress', to: 'Review' },
  icon: 'square-kanban',
  typeLabel: 'Task',
  team: { id: 't-frontend', name: 'Frontend', link: '/teams/t-frontend' },
  when: 'Just now',
  iso: new Date(NOW).toISOString(),
  fullTime: '',
  outcome: 'succeeded',
  outcomeLabel: 'Succeeded',
  metaText: '',
  ...changes,
});

const render = async (inputs: Record<string, unknown>): Promise<HTMLElement> => {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(ActivityFeedComponent);
  Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
};

describe('ActivityFeedComponent', () => {
  it('renders a rich row with profile, object and team links and the change', async () => {
    const host = await render({ items: [row('a')], label: 'Recent activity' });

    expect(host.querySelector('ol')?.getAttribute('aria-label')).toBe('Recent activity');
    expect(host.querySelector('.entry__actor')?.getAttribute('aria-label')).toBe(
      'View profile of Rahul Mehta',
    );
    expect(host.querySelector('.entry__object')?.getAttribute('href')).toBe('/tasks?task=NS-142');
    expect(host.querySelector('.entry__team')?.textContent?.trim()).toBe('Frontend');
    expect(host.querySelector('.entry__change')?.textContent).toContain('Changed from');
  });

  it('groups by day under headings and shows the type when asked', async () => {
    const host = await render({ items: [row('a')], grouped: true, showType: true, idPrefix: 'x' });

    expect(host.querySelector('h2')?.textContent?.trim()).toBe('Today');
    expect(host.querySelector('section')?.getAttribute('aria-labelledby')).toBe('af-x-0');
    expect(host.querySelector('.entry__type')?.textContent?.trim()).toBe('Task');
  });

  it('renders compact timeline rows with an outcome tag when not settled', async () => {
    const host = await render({
      items: [row('a', { outcome: 'failed', outcomeLabel: 'Failed' })],
      variant: 'timeline',
    });

    expect(host.querySelector('.line__actor')?.textContent?.trim()).toBe('Rahul');
    expect(host.querySelector('.outcome--failed')?.textContent?.trim()).toBe('Failed');
    expect(host.querySelector('.entry')).toBeNull();
  });

  it('hides the team for team pages and marks archived teams', async () => {
    const hidden = await render({ items: [row('a')], showTeam: false });
    expect(hidden.querySelector('.entry__team')).toBeNull();

    TestBed.resetTestingModule();
    const archived = await render({
      items: [row('b', { team: { id: 't-old', name: 'Legacy', link: null } })],
    });
    expect(archived.querySelector('.entry__meta')?.textContent).toContain('Legacy (archived)');
  });
});
