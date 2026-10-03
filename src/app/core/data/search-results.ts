import { formatWhen } from '../../shared/pipes/time-format';
import { presenceLabelOf } from '../../shared/pipes/presence-label';
import { MOCK_CHANNELS } from '../mocks/channels.mock';
import { MOCK_CONVERSATIONS } from '../mocks/conversations.mock';
import { MOCK_TEAMS } from '../mocks/teams.mock';
import { CURRENT_USER_ID, MOCK_USERS } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS, FileItem } from '../models/file-item';
import { Message } from '../models/message';
import { Task, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../models/task';
import { Team } from '../models/team';
import { firstNameOf, User, userColorSeed } from '../models/user';
import type { SearchHighlight, SearchResult } from './search.data';

const SNIPPET_LEAD_LENGTH = 36;
const SNIPPET_TAIL_LENGTH = 70;
const SEPARATOR = ' · ';
const ELLIPSIS = '…';
const TASK_TITLE_GAP = '  ';
const OWN_FILE_OWNER = 'You';

const usersById = new Map(MOCK_USERS.map((user) => [user.id, user]));
const teamsById = new Map(MOCK_TEAMS.map((team) => [team.id, team]));

const nameOf = (userId: string | null): string => usersById.get(userId ?? '')?.name ?? '';

const joined = (parts: readonly string[]): string => parts.filter(Boolean).join(SEPARATOR);

export const highlight = (text: string, needle: string): SearchHighlight => {
  const start = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (start < 0) {
    return { before: text, match: '', after: '' };
  }
  const end = start + needle.length;
  return { before: text.slice(0, start), match: text.slice(start, end), after: text.slice(end) };
};

const channelPath = (channel: Channel): string => `/teams/${channel.teamId}/c/${channel.id}`;

const placeOf = (conversationId: string): { title: string; path: string } => {
  const channel = MOCK_CHANNELS.find((candidate) => candidate.id === conversationId);
  if (channel) {
    return { title: `#${channel.name}`, path: channelPath(channel) };
  }
  const conversation = MOCK_CONVERSATIONS.find((candidate) => candidate.id === conversationId);
  const title = conversation?.type === 'dm' ? nameOf(conversation.userId) : conversation?.name;
  return { title: title ?? '', path: `/messages/${conversationId}` };
};

const snippetOf = (text: string, needle: string): string => {
  const matchStart = text.toLowerCase().indexOf(needle);
  const start = Math.max(0, matchStart - SNIPPET_LEAD_LENGTH);
  const snippet = text.slice(start, matchStart + needle.length + SNIPPET_TAIL_LENGTH);
  return start > 0 ? `${ELLIPSIS}${snippet}` : snippet;
};

export const toPerson = (user: User, needle: string): SearchResult => ({
  kind: 'person',
  id: user.id,
  name: user.name,
  colorSeed: userColorSeed(user.id),
  status: user.status,
  title: highlight(user.name, needle),
  subtitle: joined([user.title, presenceLabelOf(user)]),
  target: { path: `/messages/dm-${user.id}` },
});

export const toMessage = (message: Message, needle: string): SearchResult => {
  const place = placeOf(message.conversationId);
  const author = firstNameOf(nameOf(message.authorId));
  return {
    kind: 'message',
    id: message.id,
    icon: 'message-square',
    title: highlight(snippetOf(message.text, needle), needle),
    subtitle: joined([`${author} in ${place.title}`, formatWhen(message.sentAt)]),
    target: { path: place.path },
  };
};

export const toChannel = (channel: Channel, needle: string): SearchResult => ({
  kind: 'channel',
  id: channel.id,
  icon: channel.isPrivate ? 'lock' : 'hash',
  title: highlight(channel.name, needle),
  subtitle: joined([teamsById.get(channel.teamId)?.name ?? '', channel.description]),
  target: { path: channelPath(channel) },
});

export const toTeam = (team: Team, needle: string): SearchResult => ({
  kind: 'team',
  id: team.id,
  name: team.name,
  code: team.code,
  title: highlight(team.name, needle),
  subtitle: joined([`${team.memberIds.length} members`, team.description]),
  target: { path: `/teams/${team.id}` },
});

export const toTask = (task: Task, needle: string): SearchResult => ({
  kind: 'task',
  id: task.id,
  icon: 'square-kanban',
  title: highlight(`${task.id}${TASK_TITLE_GAP}${task.title}`, needle),
  subtitle: joined([
    TASK_STATUS_LABELS[task.status],
    `${TASK_PRIORITY_LABELS[task.priority]} priority`,
    nameOf(task.assigneeId),
  ]),
  target: { path: '/tasks', queryParams: { task: task.id } },
});

export const toFile = (file: FileItem, needle: string): SearchResult => ({
  kind: 'file',
  id: file.id,
  icon: FILE_TYPE_ICONS[file.type],
  title: highlight(file.name, needle),
  subtitle: joined([
    FILE_TYPE_LABELS[file.type],
    file.sizeLabel,
    file.ownerId === CURRENT_USER_ID ? OWN_FILE_OWNER : nameOf(file.ownerId),
    formatWhen(file.modifiedAt),
  ]),
  target: { path: '/files' },
});
