import { Channel } from '../models/channel';
import { Conversation } from '../models/conversation';
import { AccessRequest, RouteBlock, RouteBlockLink } from '../models/route-block';
import { Task } from '../models/task';
import { Team } from '../models/team';

export interface SettingsAccessFacts {
  readonly section: string | null;
  readonly workspaceName: string;
  readonly isGuest: boolean;
  readonly canViewAudit: boolean;
  readonly canManage: boolean;
}

export type TeamFacts = Pick<Team, 'id' | 'name' | 'memberIds' | 'isPrivate' | 'archived'>;

export interface TeamAccessFacts {
  readonly team: TeamFacts | null;
  readonly me: string;
  readonly isGuest: boolean;
  readonly workspaceName: string;
}

export interface ChannelAccessFacts {
  readonly team: Pick<Team, 'id' | 'name'>;
  readonly channel: Pick<Channel, 'name' | 'teamId' | 'isPrivate' | 'memberIds'> | null;
  readonly me: string;
  readonly owner: string;
}

export interface ConversationAccessFacts {
  readonly conversation: Conversation | null;
  readonly inWorkspace: boolean;
  readonly left: boolean;
  readonly me: string;
}

export interface TaskAccessFacts {
  readonly taskId: string;
  readonly task: Pick<Task, 'teamId'> | null;
  readonly team: Pick<Team, 'isPrivate' | 'memberIds'> | null;
  readonly me: string;
}

const AUDIT_SECTION = 'audit';
const MANAGER_SECTIONS: readonly string[] = ['security', 'integrations', 'danger'];

const backTo = (label: string, href: string): RouteBlockLink => ({
  label,
  href,
  icon: 'arrow-left',
});

const TO_WORKSPACE = backTo('Back to workspace', '/workspace');
const TO_SETTINGS = backTo('Back to workspace settings', '/workspace/settings/general');
const TO_TEAMS = backTo('Back to teams', '/teams');
const TO_MESSAGES = backTo('Back to messages', '/messages');
const TO_TASKS = backTo('Back to tasks', '/tasks');

const denied = (
  title: string,
  body: string,
  back: RouteBlockLink,
  request: AccessRequest | null = null,
): RouteBlock => ({
  kind: 'denied',
  context: {
    kicker: 'Error 403',
    icon: 'lock',
    tone: 'inverted',
    title,
    body,
    back,
    request,
    noLists: true,
  },
});

const notFound = (title: string, body: string, back: RouteBlockLink): RouteBlock => ({
  kind: 'not-found',
  context: {
    kicker: 'Not found',
    icon: null,
    tone: 'inverted',
    title,
    body,
    back,
    request: null,
    noLists: true,
  },
});

const archived = (team: TeamFacts): RouteBlock => ({
  kind: 'not-found',
  context: {
    kicker: 'Archived',
    icon: 'archive',
    tone: 'neutral',
    title: `${team.name} is archived`,
    body: 'Archived teams and their channels are read-only and hidden from lists. An owner or admin can restore it.',
    back: TO_TEAMS,
    request: null,
    noLists: true,
  },
});

export const workspaceSettingsBlockOf = (facts: SettingsAccessFacts): RouteBlock | null => {
  const { section, workspaceName } = facts;
  if (facts.isGuest) {
    return denied(
      'Workspace settings are for owners and admins',
      `Guests can’t open the settings for ${workspaceName}. Ask an owner or admin if something needs to change.`,
      TO_WORKSPACE,
    );
  }
  if (section === AUDIT_SECTION && !facts.canViewAudit) {
    return denied(
      'You don’t have access to the audit log',
      `The audit log records administrative and security changes in ${workspaceName}. Only people with the “View the audit log” permission can open it — usually owners and admins.`,
      TO_SETTINGS,
    );
  }
  if (section !== null && MANAGER_SECTIONS.includes(section) && !facts.canManage) {
    return denied(
      'Only owners and admins can open this',
      `Security, integrations and the danger zone affect all of ${workspaceName}. Ask an owner or admin if something needs to change.`,
      TO_SETTINGS,
    );
  }
  return null;
};

const hiddenFrom = (team: TeamFacts, me: string, isGuest: boolean): boolean =>
  (team.isPrivate || isGuest) && !team.memberIds.includes(me);

export const teamBlockOf = ({
  team,
  me,
  isGuest,
  workspaceName,
}: TeamAccessFacts): RouteBlock | null => {
  if (!team || hiddenFrom(team, me, isGuest)) {
    return notFound(
      'Team not found',
      `This team doesn’t exist in ${workspaceName}, or it’s private and you’re not a member.`,
      TO_TEAMS,
    );
  }
  return team.archived ? archived(team) : null;
};

export const channelBlockOf = ({
  team,
  channel,
  me,
  owner,
}: ChannelAccessFacts): RouteBlock | null => {
  const toTeam = backTo(`Back to ${team.name}`, `/teams/${team.id}`);
  if (!channel || channel.teamId !== team.id) {
    return notFound(
      'Channel not found',
      'This channel may have been deleted, or the link is wrong.',
      toTeam,
    );
  }
  if (channel.isPrivate && !channel.memberIds.includes(me)) {
    return denied(
      `You don’t have access to #${channel.name}`,
      `This is a private channel in ${team.name}. Only its members can see its messages and files. You can ask a team admin to add you.`,
      toTeam,
      { owner },
    );
  }
  return null;
};

const outsideConversation = ({ conversation, inWorkspace, left, me }: ConversationAccessFacts) =>
  !conversation ||
  conversation.type === 'channel' ||
  !inWorkspace ||
  (conversation.type === 'group' && (left || !conversation.memberIds.includes(me)));

export const conversationBlockOf = (facts: ConversationAccessFacts): RouteBlock | null =>
  outsideConversation(facts)
    ? notFound(
        'Conversation not found',
        'It may have been deleted, or you’re no longer part of it.',
        TO_MESSAGES,
      )
    : null;

export const taskBlockOf = ({ taskId, task, team, me }: TaskAccessFacts): RouteBlock | null => {
  const hidden = !!team && team.isPrivate && !team.memberIds.includes(me);
  return !task || hidden
    ? notFound(
        'Task not found',
        `${taskId} may have been deleted, or it belongs to a team you can’t see.`,
        TO_TASKS,
      )
    : null;
};
