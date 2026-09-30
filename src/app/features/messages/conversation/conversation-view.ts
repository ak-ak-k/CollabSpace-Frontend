import { Conversation } from '../../../core/models/conversation';
import { Team } from '../../../core/models/team';
import { Channel } from '../../../core/models/channel';
import { firstNameOf, PresenceStatus, User, userColorSeed } from '../../../core/models/user';
import { presenceLabelOf } from '../../../shared/pipes/presence-label';
import { formatLocalTime } from '../../../shared/pipes/time-format';
import { AvatarVariant } from '../../../shared/ui/avatar/avatar.component';
import { IconName } from '../../../shared/ui/icon/icon-registry';

export interface MemberView {
  readonly id: string;
  readonly name: string;
  readonly firstName: string;
  readonly seed: number;
  readonly status: PresenceStatus;
  readonly title: string;
  readonly presence: string;
  readonly isMe: boolean;
}

export interface PartnerProfile {
  readonly email: string;
  readonly location: string;
  readonly localTime: string;
}

export interface ConversationView {
  readonly id: string;
  readonly type: Conversation['type'];
  readonly title: string;
  readonly subtitle: string;
  readonly avatarName: string;
  readonly avatarSeed: number;
  readonly avatarStatus: PresenceStatus | null;
  readonly avatarVariant: AvatarVariant;
  readonly channelIcon: IconName | null;
  readonly isPrivate: boolean;
  readonly members: readonly MemberView[];
  readonly memberCount: number;
  readonly about: string;
  readonly intro: string;
  readonly teamName: string;
  readonly partner: MemberView | null;
  readonly profile: PartnerProfile | null;
}

export interface ConversationContext {
  readonly usersById: ReadonlyMap<string, User>;
  readonly currentUserId: string;
  readonly channel: Channel | null;
  readonly team: Team | null;
}

export const memberView = (user: User, currentUserId: string): MemberView => ({
  id: user.id,
  name: user.name,
  firstName: firstNameOf(user.name),
  seed: userColorSeed(user.id),
  status: user.status,
  title: user.title,
  presence: presenceLabelOf(user),
  isMe: user.id === currentUserId,
});

const membersOf = (ids: readonly string[], context: ConversationContext): MemberView[] =>
  ids
    .map((id) => context.usersById.get(id))
    .filter((user): user is User => user !== undefined)
    .map((user) => memberView(user, context.currentUserId));

const listNames = (members: readonly MemberView[]): string =>
  members
    .filter((member) => !member.isMe)
    .map((member) => member.firstName)
    .join(', ');

const directView = (id: string, userId: string, context: ConversationContext): ConversationView => {
  const user = context.usersById.get(userId);
  const partner = user ? memberView(user, context.currentUserId) : null;
  const members = membersOf([userId, context.currentUserId], context);
  const name = partner?.name ?? 'Unknown person';
  return {
    id,
    type: 'dm',
    title: name,
    subtitle:
      user && partner ? `${partner.presence} · ${formatLocalTime(user.timeZone)} local` : '',
    avatarName: name,
    avatarSeed: userColorSeed(userId),
    avatarStatus: partner?.status ?? null,
    avatarVariant: 'tone',
    channelIcon: null,
    isPrivate: false,
    members,
    memberCount: members.length,
    about: '',
    intro: `This is the beginning of your direct message history with ${partner?.firstName ?? 'them'}. Only the two of you are in this conversation.`,
    teamName: '',
    partner,
    profile: user
      ? {
          email: user.email,
          location: user.location,
          localTime: `${formatLocalTime(user.timeZone)} · ${user.timeZoneLabel}`,
        }
      : null,
  };
};

const groupView = (
  id: string,
  name: string,
  memberIds: readonly string[],
  context: ConversationContext,
): ConversationView => {
  const members = membersOf(memberIds, context);
  const names = listNames(members);
  return {
    id,
    type: 'group',
    title: name,
    subtitle: `${names} and you`,
    avatarName: name,
    avatarSeed: 0,
    avatarStatus: null,
    avatarVariant: 'inverted',
    channelIcon: null,
    isPrivate: false,
    members,
    memberCount: members.length,
    about: `Group conversation with ${names}.`,
    intro: `This is the start of the ${name} group with ${names}.`,
    teamName: '',
    partner: null,
    profile: null,
  };
};

const channelView = (
  id: string,
  name: string,
  memberIds: readonly string[],
  context: ConversationContext,
): ConversationView => {
  const members = membersOf(memberIds, context);
  const description = context.channel?.description ?? '';
  const isPrivate = context.channel?.isPrivate ?? false;
  return {
    id,
    type: 'channel',
    title: `#${name}`,
    subtitle: description,
    avatarName: name,
    avatarSeed: 0,
    avatarStatus: null,
    avatarVariant: 'inverted',
    channelIcon: isPrivate ? 'lock' : 'hash',
    isPrivate,
    members,
    memberCount: members.length,
    about: `${description} Created ${context.channel?.createdLabel ?? ''}.`,
    intro: `This is the start of #${name}. ${description}`,
    teamName: context.team?.name ?? '',
    partner: null,
    profile: null,
  };
};

export const buildConversationView = (
  conversation: Conversation,
  context: ConversationContext,
): ConversationView => {
  if (conversation.type === 'dm') {
    return directView(conversation.id, conversation.userId, context);
  }
  if (conversation.type === 'group') {
    return groupView(conversation.id, conversation.name, conversation.memberIds, context);
  }
  return channelView(conversation.id, conversation.name, conversation.memberIds, context);
};
