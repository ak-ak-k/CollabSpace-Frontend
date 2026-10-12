import { Channel } from '../../core/models/channel';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS, FileItem } from '../../core/models/file-item';
import { Message } from '../../core/models/message';
import { Team } from '../../core/models/team';
import { firstNameOf, User, userColorSeed } from '../../core/models/user';
import { formatWhen } from '../../shared/pipes/time-format';
import { AvatarGroupMember } from '../../shared/ui/avatar-group/avatar-group.component';
import { IconName } from '../../shared/ui/icon/icon-registry';

export type UsersById = ReadonlyMap<string, User>;

export interface TeamCardView {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description: string;
  readonly activityLevel: string;
  readonly leadLabel: string;
  readonly members: readonly AvatarGroupMember[];
  readonly memberCount: number;
  readonly channelCount: number;
  readonly unreadCount: number;
  readonly unreadLabel: string;
  readonly isPrivate: boolean;
  readonly joined: boolean;
}

export interface TeamCardCounts {
  readonly channelCount: number;
  readonly unreadCount: number;
}

export interface ChannelRowView {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: IconName;
  readonly isPrivate: boolean;
  readonly unreadCount: number;
  readonly when: string;
  readonly preview: string;
  readonly memberCount: number;
  readonly link: readonly string[];
}

export interface TeamFileView {
  readonly id: string;
  readonly name: string;
  readonly icon: IconName;
  readonly meta: string;
}

const UNKNOWN_NAME = 'Someone';

const nameOf = (usersById: UsersById, userId: string): string =>
  usersById.get(userId)?.name ?? UNKNOWN_NAME;

export const teamCardView = (
  team: Team,
  usersById: UsersById,
  currentUserId: string,
  counts: TeamCardCounts,
): TeamCardView => ({
  id: team.id,
  name: team.name,
  code: team.code,
  description: team.description,
  activityLevel: team.activityLevel,
  leadLabel: `Led by ${team.leadId === currentUserId ? 'you' : nameOf(usersById, team.leadId)}`,
  members: team.memberIds.map((id) => ({
    id,
    name: nameOf(usersById, id),
    seed: userColorSeed(id),
  })),
  memberCount: team.memberIds.length,
  channelCount: counts.channelCount,
  unreadCount: counts.unreadCount,
  unreadLabel: `${counts.unreadCount} unread messages`,
  isPrivate: team.isPrivate,
  joined: team.joined,
});

export const matchesTeamQuery = (team: Team, query: string): boolean =>
  !query || `${team.name} ${team.description}`.toLowerCase().includes(query);

const channelPreview = (
  channel: Channel,
  last: Message | undefined,
  usersById: UsersById,
): string =>
  last
    ? `${firstNameOf(nameOf(usersById, last.authorId))}: ${last.text || 'Shared a file'}`
    : channel.description;

export const channelRowView = (
  channel: Channel,
  thread: readonly Message[],
  unreadCount: number,
  usersById: UsersById,
): ChannelRowView => {
  const last = thread.at(-1);
  return {
    id: channel.id,
    name: channel.name,
    description: channel.description,
    icon: channel.isPrivate ? 'lock' : 'hash',
    isPrivate: channel.isPrivate,
    unreadCount,
    when: last ? formatWhen(last.sentAt) : '',
    preview: channelPreview(channel, last, usersById),
    memberCount: channel.memberIds.length,
    link: ['/teams', channel.teamId, 'channels', channel.id],
  };
};

export const teamFileView = (
  file: FileItem,
  usersById: UsersById,
  currentUserId: string,
): TeamFileView => {
  const owner = file.ownerId === currentUserId ? 'You' : nameOf(usersById, file.ownerId);
  return {
    id: file.id,
    name: file.name,
    icon: FILE_TYPE_ICONS[file.type] ?? 'file',
    meta: `${FILE_TYPE_LABELS[file.type] ?? 'File'} · ${file.sizeLabel} · ${owner} · ${formatWhen(file.modifiedAt)}`,
  };
};

export const isTeamFile = (file: FileItem, team: Pick<Team, 'id' | 'channelIds'>): boolean =>
  file.teamId === team.id ||
  (file.source.type === 'message' && team.channelIds.includes(file.source.conversationId));
