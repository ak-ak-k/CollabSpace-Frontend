import { MOCK_CHANNELS } from '../mocks/channels.mock';
import { MOCK_CONVERSATIONS } from '../mocks/conversations.mock';
import { buildMockMessages } from '../mocks/messages.mock';
import { MOCK_TASKS } from '../mocks/tasks.mock';
import { MOCK_TEAMS } from '../mocks/teams.mock';
import { CURRENT_USER_ID, MOCK_USERS } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import { Conversation } from '../models/conversation';
import { FileAccess, FileSourceLookup } from '../models/file-source';
import { Message } from '../models/message';
import { Team } from '../models/team';
import { channelConversation } from './chat-store';

const UNKNOWN_PERSON = 'someone';

const usersById = new Map(MOCK_USERS.map((user) => [user.id, user]));
const teamsById = new Map(MOCK_TEAMS.map((team) => [team.id, team]));
const channelsById = new Map(MOCK_CHANNELS.map((channel) => [channel.id, channel]));
const tasksById = new Map(MOCK_TASKS.map((task) => [task.id, task]));
const conversationsById = new Map<string, Conversation>([
  ...MOCK_CONVERSATIONS.map((conversation) => [conversation.id, conversation] as const),
  ...MOCK_CHANNELS.map((channel) => [channel.id, channelConversation(channel)] as const),
]);

export const SEARCHABLE_MESSAGES: readonly Message[] = Object.values(buildMockMessages())
  .flat()
  .sort((first, second) => second.sentAt - first.sentAt);

const topLevelMessageIds = new Set(
  SEARCHABLE_MESSAGES.filter((message) => !message.threadRootId).map((message) => message.id),
);

export const userNameOf = (userId: string | null): string =>
  usersById.get(userId ?? '')?.name ?? '';

export const teamOf = (teamId: string | null): Team | null => teamsById.get(teamId ?? '') ?? null;

export const conversationOf = (conversationId: string): Conversation | null =>
  conversationsById.get(conversationId) ?? null;

export const canSeeTeam = (team: Team): boolean =>
  !team.archived && (!team.isPrivate || team.memberIds.includes(CURRENT_USER_ID));

export const canSeeChannel = (channel: Channel): boolean => {
  const team = teamOf(channel.teamId);
  const member = channel.memberIds.includes(CURRENT_USER_ID);
  return !!team && canSeeTeam(team) && (!channel.isPrivate || member);
};

export const canSeeConversation = (conversation: Conversation | null): boolean => {
  if (!conversation) {
    return false;
  }
  if (conversation.type === 'channel') {
    const channel = channelsById.get(conversation.channelId);
    return !!channel && canSeeChannel(channel);
  }
  return conversation.type === 'dm' || conversation.memberIds.includes(CURRENT_USER_ID);
};

export const FILE_LOOKUP: FileSourceLookup = {
  conversation: conversationOf,
  userName: (userId) => usersById.get(userId)?.name ?? UNKNOWN_PERSON,
  teamName: (teamId) => teamOf(teamId)?.name ?? null,
  taskTitle: (taskId) => tasksById.get(taskId)?.title ?? null,
  hasMessage: (_conversationId, messageId) => topLevelMessageIds.has(messageId),
};

export const FILE_ACCESS: FileAccess = {
  currentUserId: CURRENT_USER_ID,
  channel: (channelId) => channelsById.get(channelId) ?? null,
  team: (teamId) => teamOf(teamId),
  groupMemberIds: (conversationId) => {
    const conversation = conversationOf(conversationId);
    return conversation?.type === 'group' ? conversation.memberIds : null;
  },
};
