import { ActivityEntity, ActivityEntry } from '../models/activity';
import { ChannelConversation, conversationRoute } from '../models/conversation';
import { Team } from '../models/team';

const NO_ROUTE = '';

const teamEntity = (teamId: string): ActivityEntity => ({ type: 'team', id: teamId });

const teamMembersRoute = (teamId: string): string => `/teams/${teamId}/members`;

export const teamArchiveEntry = (team: Team, archived: boolean): ActivityEntry => ({
  kind: 'team',
  verb: archived ? 'archived' : 'restored',
  object: `the ${team.name} team`,
  route: archived ? NO_ROUTE : `/teams/${team.id}`,
  category: 'activity',
  teamId: team.id,
  entity: teamEntity(team.id),
});

export const teamMembersAddedEntry = (team: Team, names: readonly string[]): ActivityEntry => ({
  kind: 'join',
  verb: 'added',
  object: `${names.length === 1 ? names[0] : `${names.length} people`} to ${team.name}`,
  route: teamMembersRoute(team.id),
  teamId: team.id,
  entity: teamEntity(team.id),
});

export const teamMemberRemovedEntry = (team: Team, name: string): ActivityEntry => ({
  kind: 'team',
  verb: 'removed',
  object: `${name} from ${team.name}`,
  route: teamMembersRoute(team.id),
  category: 'activity',
  teamId: team.id,
  entity: teamEntity(team.id),
});

export const channelArchiveEntry = (
  channel: ChannelConversation,
  archived: boolean,
): ActivityEntry => ({
  kind: 'channel',
  verb: archived ? 'archived' : 'unarchived',
  object: `#${channel.name}`,
  route: conversationRoute(channel),
  category: 'activity',
  teamId: channel.teamId,
  entity: { type: 'channel', id: channel.id },
});
