import { formatWhen } from '../../shared/pipes/time-format';
import { presenceLabelOf } from '../../shared/pipes/presence-label';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import { Conversation, conversationRoute, messageRoute, threadRoute } from '../models/conversation';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS, FileItem } from '../models/file-item';
import { sourceLabelOf } from '../models/file-source';
import { Message } from '../models/message';
import { Task, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../models/task';
import { Team } from '../models/team';
import { firstNameOf, User, userColorSeed } from '../models/user';
import { channelConversation } from './chat-store';
import { conversationOf, FILE_LOOKUP, teamOf, userNameOf } from './search-context';
import type { SearchHighlight, SearchResult } from './search.data';

const SNIPPET_LEAD_LENGTH = 36;
const SNIPPET_TAIL_LENGTH = 70;
const SEPARATOR = ' · ';
const ELLIPSIS = '…';
const TASK_TITLE_GAP = '  ';
const OWN_FILE_OWNER = 'You';
const THREAD_NOTE = 'in a thread';
const FILE_PREVIEW_PATH = '/files/recent';
const PROFILE_PATH = '/profile';

const joined = (parts: readonly string[]): string => parts.filter(Boolean).join(SEPARATOR);

export const highlight = (text: string, needle: string): SearchHighlight => {
  const start = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (start < 0) {
    return { before: text, match: '', after: '' };
  }
  const end = start + needle.length;
  return { before: text.slice(0, start), match: text.slice(start, end), after: text.slice(end) };
};

const conversationTitleOf = (conversation: Conversation | null): string => {
  switch (conversation?.type) {
    case 'channel':
      return `#${conversation.name}`;
    case 'dm':
      return userNameOf(conversation.userId);
    default:
      return conversation?.name ?? '';
  }
};

const messagePathOf = (conversation: Conversation | null, message: Message): string => {
  if (!conversation) {
    return `/messages/${message.conversationId}`;
  }
  return message.threadRootId
    ? threadRoute(conversation, message.threadRootId)
    : messageRoute(conversation, message.id);
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
  subtitle: joined([user.title, user.department, presenceLabelOf(user)]),
  target: { path: `${PROFILE_PATH}/${user.id}` },
});

export const toMessage = (message: Message, needle: string): SearchResult => {
  const conversation = conversationOf(message.conversationId);
  const author = firstNameOf(userNameOf(message.authorId));
  return {
    kind: 'message',
    id: message.id,
    icon: 'message-square',
    title: highlight(snippetOf(message.text, needle), needle),
    subtitle: joined([
      `${author} in ${conversationTitleOf(conversation)}`,
      message.threadRootId ? THREAD_NOTE : '',
      formatWhen(message.sentAt),
    ]),
    target: { path: messagePathOf(conversation, message) },
  };
};

export const toChannel = (channel: Channel, needle: string): SearchResult => ({
  kind: 'channel',
  id: channel.id,
  icon: channel.isPrivate ? 'lock' : 'hash',
  title: highlight(channel.name, needle),
  subtitle: joined([teamOf(channel.teamId)?.name ?? '', channel.description]),
  target: { path: conversationRoute(channelConversation(channel)) },
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
    userNameOf(task.assigneeId),
    teamOf(task.teamId)?.name ?? '',
  ]),
  target: { path: '/tasks', queryParams: { task: task.id } },
});

export const fileOwnerOf = (file: FileItem): string =>
  file.ownerId === CURRENT_USER_ID ? OWN_FILE_OWNER : userNameOf(file.ownerId);

export const toFile = (file: FileItem, needle: string): SearchResult => ({
  kind: 'file',
  id: file.id,
  icon: FILE_TYPE_ICONS[file.type],
  title: highlight(file.name, needle),
  subtitle: joined([
    FILE_TYPE_LABELS[file.type],
    fileOwnerOf(file),
    sourceLabelOf(file, FILE_LOOKUP),
  ]),
  target: { path: FILE_PREVIEW_PATH, queryParams: { file: file.id } },
});
