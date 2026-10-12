import { computed, inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import {
  canStartDirectConversation,
  channelBlockOf,
  conversationBlockOf,
  taskBlockOf,
  teamBlockOf,
  workspaceSettingsBlockOf,
} from '../guards/route-access';
import { RouteTarget, routeTargetOf } from '../guards/route-target';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import { LoadStatus } from '../models/load-status';
import { RouteBlock } from '../models/route-block';
import { Team } from '../models/team';
import { ChatState } from './chat.state';
import { TaskState } from './task.state';
import { WorkspaceState } from './workspace.state';

type TargetOf<Kind extends RouteTarget['kind']> = Extract<RouteTarget, { kind: Kind }>;

const FALLBACK_WORKSPACE_NAME = 'this workspace';

const isSettled = (status: LoadStatus): boolean => status === 'ready' || status === 'empty';

@Service()
export class RouteAccessState {
  private readonly router = inject(Router);
  private readonly workspace = inject(WorkspaceState);
  private readonly chat = inject(ChatState);
  private readonly tasks = inject(TaskState);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly target = computed(() => routeTargetOf(this.url()));
  readonly settingsBlock = computed(() => {
    const target = this.target();
    return target.kind === 'workspace-settings' ? this.settings(target) : null;
  });
  readonly teamBlock = computed(() => {
    const target = this.target();
    return target.kind === 'team' ? this.team(target) : null;
  });
  readonly conversationBlock = computed(() => {
    const target = this.target();
    return target.kind === 'conversation' ? this.conversation(target) : null;
  });
  readonly taskBlock = computed(() => {
    const target = this.target();
    return target.kind === 'task' ? this.task(target) : null;
  });

  private readonly workspaceName = computed(
    () => this.workspace.currentWorkspace()?.name ?? FALLBACK_WORKSPACE_NAME,
  );
  private readonly workspaceSettled = computed(() => isSettled(this.workspace.loadStatus()));
  private readonly reachableMemberIds = computed(
    () => new Set(this.workspace.memberDirectory().map((member) => member.id)),
  );

  private settings({ section }: TargetOf<'workspace-settings'>): RouteBlock | null {
    if (!this.workspaceSettled() || !this.workspace.accessKnown()) {
      return null;
    }
    const access = this.workspace.access();
    return workspaceSettingsBlockOf({
      section,
      workspaceName: this.workspaceName(),
      isGuest: access.isGuest,
      canViewAudit: access.canViewAudit,
      canManage: access.canManage,
    });
  }

  private team({ teamId, channelId }: TargetOf<'team'>): RouteBlock | null {
    if (!this.workspaceSettled()) {
      return null;
    }
    const team = this.workspace.anyTeam(teamId);
    const blocked = teamBlockOf({
      team,
      me: CURRENT_USER_ID,
      isGuest: this.workspace.access().isGuest,
      workspaceName: this.workspaceName(),
    });
    return blocked ?? (team && channelId ? this.channel(team, channelId) : null);
  }

  private channel(team: Team, channelId: string): RouteBlock | null {
    const channel = this.workspace.channels().find((candidate) => candidate.id === channelId);
    return channelBlockOf({
      team,
      channel: channel ? { ...channel, memberIds: this.channelMembers(channel) } : null,
      me: CURRENT_USER_ID,
      owner: this.workspace.user(team.leadId)?.name ?? '',
    });
  }

  private channelMembers(channel: Channel): readonly string[] {
    const conversation = this.chat.conversation(channel.id);
    return conversation?.type === 'channel' ? conversation.memberIds : channel.memberIds;
  }

  private conversation({ conversationId }: TargetOf<'conversation'>): RouteBlock | null {
    if (!this.workspaceSettled() || !isSettled(this.chat.status())) {
      return null;
    }
    const conversation = this.chat.conversation(conversationId);
    if (!conversation && canStartDirectConversation(conversationId, this.reachableMemberIds())) {
      return null;
    }
    return conversationBlockOf({
      conversation,
      inWorkspace: !!conversation && this.workspace.containsConversation(conversation),
      left: this.chat.hasLeft(conversationId),
      me: CURRENT_USER_ID,
    });
  }

  private task({ taskId }: TargetOf<'task'>): RouteBlock | null {
    if (!this.workspaceSettled() || !isSettled(this.tasks.loadStatus())) {
      return null;
    }
    const task = this.tasks.task(taskId);
    return taskBlockOf({
      taskId,
      task,
      team: task?.teamId ? this.workspace.anyTeam(task.teamId) : null,
      me: CURRENT_USER_ID,
    });
  }
}
