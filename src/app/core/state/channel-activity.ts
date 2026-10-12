import { ActivityEntry } from '../models/activity';
import { Channel, ChannelChanges } from '../models/channel';
import { privacyLabelOf } from './team-activity';

type ActivityChannel = Pick<Channel, 'id' | 'teamId' | 'name'>;

type PrivacyChannel = ActivityChannel & Pick<Channel, 'isPrivate'>;

export const channelRouteOf = (channel: Pick<Channel, 'id' | 'teamId'>): string =>
  `/teams/${channel.teamId}/channels/${channel.id}`;

const channelBase = (
  channel: ActivityChannel,
): Pick<ActivityEntry, 'teamId' | 'entity' | 'route'> => ({
  teamId: channel.teamId,
  entity: { type: 'channel', id: channel.id },
  route: channelRouteOf(channel),
});

export const channelCreatedEntry = (channel: PrivacyChannel, teamName: string): ActivityEntry => ({
  kind: 'channel',
  verb: 'created',
  object: `#${channel.name} in ${teamName}`,
  action: 'channel.created',
  meta: { privacy: privacyLabelOf(channel.isPrivate) },
  ...channelBase(channel),
});

export const channelArchiveEntry = (
  channel: ActivityChannel,
  archived: boolean,
): ActivityEntry => ({
  kind: 'channel',
  verb: archived ? 'archived' : 'unarchived',
  object: `#${channel.name}`,
  category: 'activity',
  action: archived ? 'channel.archived' : 'channel.unarchived',
  audit: true,
  ...channelBase(channel),
});

export const channelUpdateEntries = (
  channel: PrivacyChannel & Pick<Channel, 'description'>,
  changes: Partial<ChannelChanges>,
): ActivityEntry[] => {
  const name = changes.name || channel.name;
  const entries: ActivityEntry[] = [];
  if (changes.name && changes.name !== channel.name) {
    entries.push({
      kind: 'channel',
      verb: 'renamed',
      object: `#${channel.name} to #${changes.name}`,
      action: 'channel.renamed',
      audit: true,
      change: { from: `#${channel.name}`, to: `#${changes.name}` },
      ...channelBase(channel),
    });
  }
  if (changes.isPrivate !== undefined && changes.isPrivate !== channel.isPrivate) {
    entries.push({
      kind: 'channel',
      verb: 'made',
      object: `#${name} ${changes.isPrivate ? 'private' : 'public'}`,
      action: 'channel.privacy_changed',
      audit: true,
      change: { from: privacyLabelOf(channel.isPrivate), to: privacyLabelOf(changes.isPrivate) },
      ...channelBase(channel),
    });
  }
  if (changes.description !== undefined && changes.description !== channel.description) {
    entries.push({
      kind: 'channel',
      verb: 'updated the description of',
      object: `#${name}`,
      action: 'channel.updated',
      ...channelBase(channel),
    });
  }
  return entries;
};
