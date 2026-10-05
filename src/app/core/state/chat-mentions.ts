import { MentionCandidate, MentionTrigger } from '../models/thread';
import { firstNameOf, userColorSeed } from '../models/user';

export interface MentionPerson {
  readonly id: string;
  readonly name: string;
  readonly title: string;
}

export interface MentionChannel {
  readonly id: string;
  readonly name: string;
  readonly isPrivate: boolean;
  readonly teamName: string;
}

export interface MentionSources {
  readonly currentUserId: string;
  readonly members: readonly MentionPerson[];
  readonly workspaceMembers: readonly MentionPerson[];
  readonly channels: readonly MentionChannel[];
  readonly direct: boolean;
  readonly allowEveryone: boolean;
}

const SPECIAL_MENTIONS: readonly (readonly [string, string])[] = [
  ['here', 'Notify everyone who’s online here'],
  ['everyone', 'Notify everyone in this conversation'],
];
const OUTSIDER_NOTE = ' · not in this conversation';
const OUTSIDER_LIMIT = 3;
const PEOPLE_LIMIT = 7;
const CHANNEL_LIMIT = 6;

const personCandidate = (person: MentionPerson, outsider: boolean): MentionCandidate => {
  const firstName = firstNameOf(person.name);
  return {
    id: person.id,
    kind: outsider ? 'outsider' : 'member',
    token: `@${firstName}`,
    name: person.name,
    firstName,
    title: outsider ? `${person.title}${OUTSIDER_NOTE}` : person.title,
    seed: userColorSeed(person.id),
  };
};

const specialCandidate = ([key, title]: readonly [string, string]): MentionCandidate => ({
  id: `@${key}`,
  kind: 'special',
  token: `@${key}`,
  name: `@${key}`,
  firstName: key,
  title,
  seed: 0,
});

const channelCandidate = (channel: MentionChannel): MentionCandidate => ({
  id: channel.id,
  kind: 'channel',
  token: `#${channel.name}`,
  name: `#${channel.name}`,
  firstName: channel.name,
  title: channel.teamName,
  seed: 0,
});

export const buildMentionCandidates = (sources: MentionSources): MentionCandidate[] => {
  const notMe = (person: MentionPerson) => person.id !== sources.currentUserId;
  const memberIds = new Set(sources.members.map((person) => person.id));
  const members = sources.members.filter(notMe).map((person) => personCandidate(person, false));
  const channels = sources.channels.filter((channel) => !channel.isPrivate).map(channelCandidate);
  if (sources.direct) {
    return [...members, ...channels];
  }
  const specials = sources.allowEveryone ? SPECIAL_MENTIONS.map(specialCandidate) : [];
  const outsiders = sources.workspaceMembers
    .filter((person) => notMe(person) && !memberIds.has(person.id))
    .map((person) => personCandidate(person, true));
  return [...members, ...specials, ...outsiders, ...channels];
};

const matchesPerson = (candidate: MentionCandidate, needle: string): boolean =>
  candidate.firstName.toLowerCase().startsWith(needle) ||
  candidate.name.toLowerCase().includes(needle);

export const suggestMentions = (
  candidates: readonly MentionCandidate[],
  trigger: MentionTrigger,
  query: string,
): readonly MentionCandidate[] => {
  const needle = query.toLowerCase();
  const ofKind = (kind: MentionCandidate['kind']) =>
    candidates.filter((candidate) => candidate.kind === kind);
  if (trigger === '#') {
    return ofKind('channel')
      .filter((candidate) => candidate.firstName.startsWith(needle))
      .slice(0, CHANNEL_LIMIT);
  }
  return [
    ...ofKind('member').filter((candidate) => matchesPerson(candidate, needle)),
    ...ofKind('special').filter((candidate) => candidate.firstName.startsWith(needle)),
    ...ofKind('outsider')
      .filter((candidate) => matchesPerson(candidate, needle))
      .slice(0, OUTSIDER_LIMIT),
  ].slice(0, PEOPLE_LIMIT);
};
