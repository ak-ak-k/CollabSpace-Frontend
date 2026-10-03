import { Channel } from '../../../core/models/channel';
import { Team } from '../../../core/models/team';

export const CHANNEL_NAME_MAX_LENGTH = 40;
export const CHANNEL_DESCRIPTION_MAX_LENGTH = 160;

const CHANNEL_NAME_MIN_LENGTH = 2;
const LEADING_HASHES = /^#+/;
const WORD_BREAKS = /[\s_]+/g;
const DISALLOWED_CHARACTERS = /[^a-z0-9-]/g;
const REPEATED_DASHES = /-{2,}/g;
const PLACEHOLDER_NAME = 'this-channel';

export const cleanChannelName = (raw: string): string =>
  raw
    .toLowerCase()
    .replace(LEADING_HASHES, '')
    .replace(WORD_BREAKS, '-')
    .replace(DISALLOWED_CHARACTERS, '')
    .replace(REPEATED_DASHES, '-')
    .slice(0, CHANNEL_NAME_MAX_LENGTH);

export const channelNameError = (
  name: string,
  team: Team | null,
  channels: readonly Channel[],
): string => {
  if (!name) {
    return 'Give the channel a name.';
  }
  if (name.length < CHANNEL_NAME_MIN_LENGTH) {
    return 'Use at least 2 characters.';
  }
  const taken = channels.some((channel) => channel.teamId === team?.id && channel.name === name);
  return taken && team ? `#${name} already exists in ${team.name}.` : '';
};

export const channelPrivacyHelp = (isPrivate: boolean, name: string): string =>
  isPrivate
    ? `Only people you add can see and join #${name || PLACEHOLDER_NAME}.`
    : 'Anyone in the team can find and join it.';
