import { Channel } from '../../../core/models/channel';
import { Team } from '../../../core/models/team';
import { User, WorkspaceRole } from '../../../core/models/user';
import { Workspace } from '../../../core/models/workspace';
import { WORKSPACE_ROLE_LABELS } from '../../../core/models/workspace-role';
import { workspaceUrlOf } from '../../../core/models/workspace-rules';
import { formatCount } from '../../../shared/pipes/count.pipe';
import { IconName } from '../../../shared/ui/icon/icon-registry';
import { memberFilterLink, MEMBERS_ROUTE } from '../members-view';

export interface OverviewStat {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly value: number;
  readonly caption: string;
  readonly link: string;
}

export interface OverviewStatInput {
  readonly people: readonly User[];
  readonly pendingInvites: number;
  readonly teams: readonly Team[];
  readonly channels: readonly Channel[];
}

export interface OverviewTeamRow {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly isPrivate: boolean;
  readonly meta: string;
}

export interface OverviewDetail {
  readonly term: string;
  readonly value: string;
}

const TEAMS_ROUTE = '/teams';
const NONE_YET = 'None yet';
const NO_VALUE = '—';

export const overviewStats = ({
  people,
  pendingInvites,
  teams,
  channels,
}: OverviewStatInput): readonly OverviewStat[] => {
  const joined = teams.filter((team) => team.joined).length;
  const privateChannels = channels.filter((channel) => channel.isPrivate).length;
  const online = people.filter((user) => user.status === 'online').length;
  return [
    {
      id: 'members',
      label: 'Members',
      icon: 'users',
      value: people.length,
      caption: pendingInvites
        ? formatCount(pendingInvites, 'pending invitation')
        : 'No pending invitations',
      link: MEMBERS_ROUTE,
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: 'layers',
      value: teams.length,
      caption: teams.length ? `You’re in ${joined}` : NONE_YET,
      link: TEAMS_ROUTE,
    },
    {
      id: 'channels',
      label: 'Channels',
      icon: 'hash',
      value: channels.length,
      caption: channels.length ? `${privateChannels} private` : NONE_YET,
      link: TEAMS_ROUTE,
    },
    {
      id: 'online',
      label: 'Online now',
      icon: 'activity',
      value: online,
      caption: `of ${formatCount(people.length, 'member')}`,
      link: memberFilterLink('online'),
    },
  ];
};

export const overviewTeamRow = (team: Team): OverviewTeamRow => ({
  id: team.id,
  name: team.name,
  code: team.code,
  isPrivate: team.isPrivate,
  meta: `${formatCount(team.memberIds.length, 'member')} · ${formatCount(team.channelIds.length, 'channel')}`,
});

const ownerLabel = (owner: User | null, viewerId: string): string => {
  if (!owner) {
    return NO_VALUE;
  }
  return owner.id === viewerId ? `${owner.name} (you)` : owner.name;
};

export const workspaceDetails = (
  workspace: Workspace,
  owner: User | null,
  viewerId: string,
  myRole: WorkspaceRole,
): readonly OverviewDetail[] => [
  { term: 'Owner', value: ownerLabel(owner, viewerId) },
  { term: 'Plan', value: workspace.plan },
  { term: 'Created', value: workspace.createdLabel },
  { term: 'Address', value: workspaceUrlOf(workspace.slug) },
  { term: 'Your role', value: WORKSPACE_ROLE_LABELS[myRole] },
];
