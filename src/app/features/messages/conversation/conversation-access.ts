import { computed, inject, Signal } from '@angular/core';
import { GENERAL_CHANNEL_NAME } from '../../../core/models/channel';
import { Team } from '../../../core/models/team';
import { ChatState } from '../../../core/state/chat.state';
import { TeamMembershipState } from '../../../core/state/team-membership.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { IconName } from '../../../shared/ui/icon/icon-registry';
import { ConversationView } from './conversation-view';

export type JoinBarAction = 'unarchive' | 'join-team' | 'rejoin';

export interface JoinBarView {
  readonly conversationId: string;
  readonly icon: IconName;
  readonly text: string;
  readonly action: JoinBarAction | null;
  readonly actionLabel: string;
  readonly team: Team | null;
}

export interface ConversationAccess {
  readonly joinBar: JoinBarView | null;
  readonly canEditChannel: boolean;
  readonly canArchiveChannel: boolean;
  readonly canRemoveMembers: boolean;
  readonly canRename: boolean;
}

const NO_ACCESS: ConversationAccess = {
  joinBar: null,
  canEditChannel: false,
  canArchiveChannel: false,
  canRemoveMembers: false,
  canRename: false,
};

interface AccessFacts {
  readonly view: ConversationView;
  readonly team: Team | null;
  readonly me: string;
  readonly manager: boolean;
  readonly archived: boolean;
  readonly left: boolean;
}

const joinBarOf = ({ view, team, manager, archived, left }: AccessFacts): JoinBarView | null => {
  const base = { conversationId: view.id, team };
  if (archived) {
    return {
      ...base,
      icon: 'archive',
      text: `${view.title} is archived. You can read it, but nobody can post.`,
      action: manager ? 'unarchive' : null,
      actionLabel: 'Unarchive',
    };
  }
  if (team && !team.joined) {
    return {
      ...base,
      icon: 'users',
      text: `Join ${team.name} to post in ${view.title}.`,
      action: 'join-team',
      actionLabel: 'Join team',
    };
  }
  if (left && view.type === 'channel') {
    return {
      ...base,
      icon: 'hash',
      text: `You left ${view.title}.`,
      action: 'rejoin',
      actionLabel: 'Join channel',
    };
  }
  return null;
};

const accessOf = (facts: AccessFacts): ConversationAccess => {
  const { view, me, manager, archived } = facts;
  const isChannel = view.type === 'channel';
  const creator = view.createdBy === me;
  return {
    joinBar: joinBarOf(facts),
    canEditChannel: isChannel && (manager || creator),
    canArchiveChannel:
      isChannel && manager && view.title !== `#${GENERAL_CHANNEL_NAME}` && !archived,
    canRemoveMembers:
      (view.type === 'group' && creator) || (isChannel && view.isPrivate && (creator || manager)),
    canRename: view.type === 'group',
  };
};

export const injectConversationAccess = (
  view: Signal<ConversationView | null>,
): Signal<ConversationAccess> => {
  const chat = inject(ChatState);
  const workspace = inject(WorkspaceState);
  const teams = inject(TeamMembershipState);
  return computed(() => {
    const current = view();
    if (!current) {
      return NO_ACCESS;
    }
    const me = workspace.currentUser()?.id ?? '';
    const team = current.teamId ? workspace.team(current.teamId) : null;
    return accessOf({
      view: current,
      team,
      me,
      manager: workspace.access().canManage || (team !== null && teams.canManageTeam(team.id)),
      archived: chat.isArchived(current.id),
      left: chat.hasLeft(current.id),
    });
  });
};
