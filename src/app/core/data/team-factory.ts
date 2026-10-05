import { Channel } from '../models/channel';
import { NewTeam, Team } from '../models/team';

export interface CreatedTeam {
  readonly team: Team;
  readonly channel: Channel;
}

const CODE_LENGTH = 2;

export const slugOf = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'team';

export const teamCodeOf = (name: string): string => {
  const words = name.trim().split(/\s+/);
  const letters =
    words.length > 1
      ? words[0][0] + words[1][0]
      : name.replace(/[^A-Za-z0-9]/g, '').slice(0, CODE_LENGTH);
  return letters.toUpperCase();
};

export const monthAndYear = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

export const buildTeam = (
  newTeam: NewTeam,
  workspaceId: string,
  sequence: number,
  creatorId: string,
): CreatedTeam => {
  const slug = slugOf(newTeam.name);
  const teamId = `t-${slug}-${sequence}`;
  const channelId = `c-${slug}-${sequence}`;
  const createdLabel = monthAndYear(new Date());
  const isPrivate = newTeam.privacy === 'private';
  const team: Team = {
    id: teamId,
    workspaceId,
    name: newTeam.name,
    code: teamCodeOf(newTeam.name),
    description: newTeam.description || 'No description yet.',
    memberIds: [creatorId],
    leadId: creatorId,
    ownerId: creatorId,
    adminIds: [],
    channelIds: [channelId],
    activityLevel: 'New',
    weeklyMessageCount: 0,
    createdLabel,
    joined: true,
    isPrivate,
    archived: false,
  };
  const channel: Channel = {
    id: channelId,
    teamId,
    name: 'general',
    description: `Announcements and day-to-day conversation for ${newTeam.name}.`,
    memberIds: [creatorId],
    isPrivate,
    createdLabel,
    createdBy: creatorId,
  };
  return { team, channel };
};
