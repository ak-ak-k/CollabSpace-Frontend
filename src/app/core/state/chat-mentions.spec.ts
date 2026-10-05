import { buildMentionCandidates, MentionSources, suggestMentions } from './chat-mentions';

const SOURCES: MentionSources = {
  currentUserId: 'u0',
  members: [
    { id: 'u0', name: 'Aarav Shah', title: 'Lead' },
    { id: 'u1', name: 'Rahul Mehta', title: 'Engineer' },
  ],
  workspaceMembers: [
    { id: 'u0', name: 'Aarav Shah', title: 'Lead' },
    { id: 'u1', name: 'Rahul Mehta', title: 'Engineer' },
    { id: 'u2', name: 'Priya Sharma', title: 'Designer' },
    { id: 'u3', name: 'Rhea Kapoor', title: 'PM' },
    { id: 'u4', name: 'Ravi Iyer', title: 'QA' },
    { id: 'u5', name: 'Rohan Das', title: 'Ops' },
  ],
  channels: [
    { id: 'c-frontend', name: 'frontend', isPrivate: false, teamName: 'Frontend' },
    { id: 'c-secret', name: 'finance', isPrivate: true, teamName: 'Finance' },
  ],
  direct: false,
  allowEveryone: true,
};

const names = (sources: MentionSources, trigger: '@' | '#', query: string) =>
  suggestMentions(buildMentionCandidates(sources), trigger, query).map((item) => item.name);

describe('mention candidates', () => {
  it('lists members first, then @here and @everyone, then up to three outsiders', () => {
    const suggestions = suggestMentions(buildMentionCandidates(SOURCES), '@', 'r');

    expect(suggestions.map((item) => item.name)).toEqual([
      'Rahul Mehta',
      'Priya Sharma',
      'Rhea Kapoor',
      'Ravi Iyer',
    ]);
    expect(suggestions[1].title).toBe('Designer · not in this conversation');
    expect(names(SOURCES, '@', 'e')).toEqual([
      'Rahul Mehta',
      '@everyone',
      'Rhea Kapoor',
      'Ravi Iyer',
    ]);
  });

  it('drops @here, @everyone and outsiders in direct messages or when the workspace turns them off', () => {
    expect(names({ ...SOURCES, allowEveryone: false }, '@', 'e')).not.toContain('@everyone');
    expect(names({ ...SOURCES, direct: true }, '@', '')).toEqual(['Rahul Mehta']);
  });

  it('suggests public channels for # with the team name as the sub-line', () => {
    const suggestions = suggestMentions(buildMentionCandidates(SOURCES), '#', 'f');

    expect(suggestions.map((item) => [item.token, item.title])).toEqual([
      ['#frontend', 'Frontend'],
    ]);
  });
});
