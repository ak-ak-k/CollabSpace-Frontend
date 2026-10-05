import { IconName } from '../../shared/ui/icon/icon-registry';
import { Channel } from './channel';
import { Conversation, conversationRoute } from './conversation';
import { FileItem, FileSourceKind } from './file-item';
import { Team } from './team';

export interface FileLink {
  readonly path: string;
  readonly queryParams?: Readonly<Record<string, string>>;
}

export interface FileSourceInfo {
  readonly kind: FileSourceKind;
  readonly label: string;
  readonly icon: IconName;
  readonly link: FileLink | null;
}

export interface FileSourceLookup {
  readonly conversation: (conversationId: string) => Conversation | null;
  readonly userName: (userId: string) => string;
  readonly teamName: (teamId: string) => string | null;
  readonly taskTitle: (taskId: string) => string | null;
  readonly hasMessage: (conversationId: string, messageId: string) => boolean;
}

export type FileChannelAccess = Pick<Channel, 'teamId' | 'memberIds' | 'isPrivate'>;
export type FileTeamAccess = Pick<Team, 'memberIds' | 'isPrivate'>;

export interface FileAccess {
  readonly currentUserId: string;
  readonly channel: (channelId: string) => FileChannelAccess | null;
  readonly team: (teamId: string) => FileTeamAccess | null;
  readonly groupMemberIds?: (conversationId: string) => readonly string[] | null;
}

export const FILE_TASK_QUERY_PARAM = 'task';
const TASKS_PATH = '/tasks';
const MESSAGE_SEGMENT = 'm';
const TITLE_SEPARATOR = ' · ';

const conversationLabel = (conversation: Conversation, lookup: FileSourceLookup): string => {
  switch (conversation.type) {
    case 'dm':
      return `DM with ${lookup.userName(conversation.userId)}`;
    case 'group':
      return conversation.name;
    default:
      return `#${conversation.name}`;
  }
};

export const messageRouteOf = (conversation: Conversation, messageId: string | null): string => {
  const route = conversationRoute(conversation);
  return messageId ? `${route}/${MESSAGE_SEGMENT}/${messageId}` : route;
};

export const conversationReference = (
  conversation: Conversation,
  lookup: FileSourceLookup,
  messageId: string | null = null,
): FileSourceInfo => ({
  kind: 'message',
  label: conversationLabel(conversation, lookup),
  icon: conversation.type === 'channel' ? 'hash' : 'message-square',
  link: { path: messageRouteOf(conversation, messageId) },
});

export const taskReference = (taskId: string, lookup: FileSourceLookup): FileSourceInfo => {
  const title = lookup.taskTitle(taskId);
  return {
    kind: 'task',
    label: title ? `${taskId}${TITLE_SEPARATOR}${title}` : taskId,
    icon: 'square-kanban',
    link: { path: TASKS_PATH, queryParams: { [FILE_TASK_QUERY_PARAM]: taskId } },
  };
};

const uploadReference = (file: FileItem, lookup: FileSourceLookup): FileSourceInfo => {
  const teamName = file.teamId ? lookup.teamName(file.teamId) : null;
  if (file.teamId && teamName) {
    return {
      kind: 'upload',
      label: `Uploaded to ${teamName}`,
      icon: 'users',
      link: { path: `/teams/${file.teamId}/files` },
    };
  }
  return { kind: 'upload', label: 'Uploaded directly', icon: 'upload', link: null };
};

export const sourceOf = (file: FileItem, lookup: FileSourceLookup): FileSourceInfo => {
  const source = file.source;
  if (source.type === 'task') {
    return taskReference(source.taskId, lookup);
  }
  const conversation =
    source.type === 'message' ? lookup.conversation(source.conversationId) : null;
  if (source.type === 'message' && conversation) {
    const linkedMessage =
      source.messageId && lookup.hasMessage(source.conversationId, source.messageId)
        ? source.messageId
        : null;
    return conversationReference(conversation, lookup, linkedMessage);
  }
  return uploadReference(file, lookup);
};

export const sourceLabelOf = (file: FileItem, lookup: FileSourceLookup): string =>
  sourceOf(file, lookup).label;

export const sourceRouteOf = (file: FileItem, lookup: FileSourceLookup): FileLink | null =>
  sourceOf(file, lookup).link;

export const referencesOf = (
  file: FileItem,
  lookup: FileSourceLookup,
  sharedConversationIds: readonly string[],
): readonly FileSourceInfo[] => {
  const source = sourceOf(file, lookup);
  const sourceTaskId = file.source.type === 'task' ? file.source.taskId : null;
  const sourceConversationId = file.source.type === 'message' ? file.source.conversationId : null;
  const tasks = file.taskIds
    .filter((taskId) => taskId !== sourceTaskId)
    .map((taskId) => taskReference(taskId, lookup));
  const conversations = sharedConversationIds
    .filter((conversationId) => conversationId !== sourceConversationId)
    .map((conversationId) => lookup.conversation(conversationId))
    .filter((conversation) => conversation !== null)
    .map((conversation) => conversationReference(conversation, lookup));
  return [...(source.link ? [source] : []), ...tasks, ...conversations];
};

const canSeeTeam = (teamId: string, access: FileAccess): boolean => {
  const team = access.team(teamId);
  return !team || !team.isPrivate || team.memberIds.includes(access.currentUserId);
};

const canSeeChannel = (channel: FileChannelAccess, access: FileAccess): boolean =>
  (!channel.isPrivate || channel.memberIds.includes(access.currentUserId)) &&
  canSeeTeam(channel.teamId, access);

export const canSeeFile = (file: FileItem, access: FileAccess): boolean => {
  if (file.source.type === 'message') {
    const channel = access.channel(file.source.conversationId);
    if (channel) {
      return canSeeChannel(channel, access);
    }
    const groupMembers = access.groupMemberIds?.(file.source.conversationId);
    if (groupMembers) {
      return groupMembers.includes(access.currentUserId);
    }
  }
  return !file.teamId || canSeeTeam(file.teamId, access);
};
