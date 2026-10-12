import { TestBed } from '@angular/core/testing';
import { MOCK_LATENCY } from './mock-request';
import { highlight, OVERVIEW_GROUP_LIMIT, SearchData } from './search.data';

describe('SearchData', () => {
  let data: SearchData;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MOCK_LATENCY, useValue: { minimum: 0, maximum: 0 } }],
    });
    data = TestBed.inject(SearchData);
  });

  it('finds a person and links to their profile', async () => {
    const groups = await data.search('priya');
    const people = groups.find((group) => group.key === 'people');

    expect(people?.items[0]).toEqual(
      expect.objectContaining({
        kind: 'person',
        name: 'Priya Sharma',
        title: { before: '', match: 'Priya', after: ' Sharma' },
        subtitle: expect.stringContaining('Product Designer · Design'),
        target: { path: '/profile/u2' },
      }),
    );
  });

  it('finds people by department', async () => {
    const groups = await data.search('design', 'people');

    expect(groups[0].items.map((item) => item.id)).toContain('u2');
  });

  it('opens a file in the preview and finds files by type', async () => {
    const groups = await data.search('figma', 'files');

    expect(groups[0].items.length).toBeGreaterThan(0);
    expect(groups[0].items[0].target).toEqual({
      path: '/files/recent',
      queryParams: { file: groups[0].items[0].id },
    });
  });

  it('links a thread reply to its thread', async () => {
    const groups = await data.search('timebox it', 'messages');

    expect(groups[0].items[0].target.path).toBe(
      '/teams/t-frontend/channels/c-frontend/thread/c-frontend-t1',
    );
  });

  it('finds a task by its id', async () => {
    const groups = await data.search('ns-142', 'tasks');

    expect(groups.map((group) => group.key)).toEqual(['tasks']);
    expect(groups[0].items[0]).toEqual(
      expect.objectContaining({
        id: 'NS-142',
        target: { path: '/tasks', queryParams: { task: 'NS-142' } },
      }),
    );
  });

  it('returns nothing for an empty query', async () => {
    expect(await data.search('   ')).toEqual([]);
  });

  it('returns only the requested category', async () => {
    const groups = await data.search('design', 'teams');

    expect(groups.map((group) => group.key)).toEqual(['teams']);
    expect(groups[0].hasMore).toBe(false);
  });

  it('caps every category in the overview and keeps the fixed order', async () => {
    const groups = await data.search('e');
    const order = groups.map((group) => group.key);

    expect(order).toEqual(['people', 'messages', 'channels', 'teams', 'tasks', 'files']);
    expect(groups.every((group) => group.items.length <= OVERVIEW_GROUP_LIMIT)).toBe(true);
    expect(groups[0].hasMore).toBe(true);
  });

  it('links a channel to its team route', async () => {
    const groups = await data.search('design-system', 'channels');

    expect(groups[0].items[0].target.path).toBe('/teams/t-frontend/channels/c-design-system');
  });

  it('links every message to the message or its thread', async () => {
    const groups = await data.search('the', 'messages');
    const paths = groups[0].items.map((item) => item.target.path);
    const route = /^\/(messages\/[\w-]+|teams\/[\w-]+\/channels\/[\w-]+)\/(m|thread)\/[\w-]+$/;

    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((path) => route.test(path))).toBe(true);
  });

  it('leaves the highlight empty when the title does not match', () => {
    expect(highlight('Rahul Mehta', 'engineer')).toEqual({
      before: 'Rahul Mehta',
      match: '',
      after: '',
    });
  });

  it('limits results to the workspace it is asked about', async () => {
    const scope = { workspaceId: 'w2', memberIds: new Set(['u0', 'u2', 'u24']) };

    const people = await data.search('priya', 'people', scope);
    const tasks = await data.search('ns-142', 'tasks', scope);

    expect(people[0]?.items.map((item) => item.id)).toEqual(['u2']);
    expect(tasks).toEqual([]);
  });

  it('hides messages, channels and group files from conversations the viewer left', async () => {
    const scope = { workspaceId: 'w1', memberIds: new Set<string>() };
    const left = { ...scope, hiddenConversationIds: new Set(['g-launch', 'c-releases']) };

    expect((await data.search('monochrome', 'messages', scope)).length).toBe(1);
    expect(await data.search('monochrome', 'messages', left)).toEqual([]);
    expect(
      (await data.search('releases', 'channels', scope))[0].items.map((item) => item.id),
    ).toContain('c-releases');
    expect(
      (await data.search('releases', 'channels', left))[0]?.items.map((item) => item.id) ?? [],
    ).not.toContain('c-releases');
  });
});
