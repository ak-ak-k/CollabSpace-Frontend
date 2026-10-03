import { DialogRef } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceRole } from '../../core/models/user';
import { roleWithArticle } from '../../core/models/workspace-role';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { ChatState } from '../../core/state/chat.state';
import { WorkspaceActivityState } from '../../core/state/workspace-activity.state';
import { WorkspaceAdminState } from '../../core/state/workspace-admin.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import {
  ChangeRoleDialogComponent,
  ChangeRoleDialogData,
} from './change-role-dialog/change-role-dialog.component';
import {
  MemberActionsSheetComponent,
  MemberActionsSheetData,
} from './member-actions-sheet/member-actions-sheet.component';
import {
  MemberProfileDrawerComponent,
  MemberProfileDrawerData,
  MemberProfileDrawerResult,
} from './member-profile-drawer/member-profile-drawer.component';
import {
  canChangeMember,
  MemberActionKind,
  MemberMenuItem,
  memberMenuItems,
} from './member-actions-view';
import { MemberRow, MEMBERS_ROUTE } from './members-view';

const PROFILE_DRAWER_WIDTH = 'var(--workspace-profile-drawer-width)';
const PROFILE_ROUTE = '/profile';
const MESSAGES_ROUTE = '/messages';

@Service()
export class MemberActions {
  private readonly workspace = inject(WorkspaceState);
  private readonly admin = inject(WorkspaceAdminState);
  private readonly activity = inject(WorkspaceActivityState);
  private readonly chat = inject(ChatState);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  private readonly handlers: Record<MemberActionKind, (userId: string) => void> = {
    profile: (userId) => this.openProfile(userId),
    'edit-profile': () => void this.router.navigateByUrl(PROFILE_ROUTE),
    message: (userId) => void this.message(userId),
    role: (userId) => this.changeRole(userId),
    remove: (userId) => void this.remove(userId),
  };

  canChange(userId: string): boolean {
    const member = this.workspace.user(userId);
    return (
      !!member &&
      canChangeMember(this.workspace.access(), member.role, this.admin.canRemove(userId))
    );
  }

  menuItems(member: MemberRow): readonly MemberMenuItem[] {
    return memberMenuItems(member, this.canChange(member.id));
  }

  run(kind: MemberActionKind, userId: string): void {
    this.handlers[kind](userId);
  }

  openSheet(member: MemberRow): DialogRef<MemberActionKind> {
    const sheet = this.dialogs.openDrawer<MemberActionKind, MemberActionsSheetData>(
      MemberActionsSheetComponent,
      {
        data: { member, items: this.menuItems(member) },
        side: 'bottom',
        ariaLabel: `Actions for ${member.name}`,
      },
    );
    sheet.closed.subscribe((kind) => kind && this.run(kind, member.id));
    return sheet;
  }

  openProfile(userId: string): void {
    const drawer = this.dialogs.openDrawer<MemberProfileDrawerResult, MemberProfileDrawerData>(
      MemberProfileDrawerComponent,
      { data: { userId }, side: 'right', size: 'md' },
    );
    drawer.updateSize(PROFILE_DRAWER_WIDTH);
    drawer.closed.subscribe((result) => result && this.run(result, userId));
  }

  changeRole(userId: string): void {
    const dialog = this.dialogs.open<WorkspaceRole, ChangeRoleDialogData>(
      ChangeRoleDialogComponent,
      { data: { userId }, size: 'md' },
    );
    dialog.closed.subscribe((role) => role && void this.applyRole(userId, role));
  }

  async message(userId: string): Promise<void> {
    const conversationId = await this.chat.openDirectConversation(userId);
    await this.router.navigate([MESSAGES_ROUTE, conversationId]);
  }

  async remove(userId: string): Promise<void> {
    const member = this.workspace.user(userId);
    const workspaceName = this.workspaceName();
    if (!member) {
      return;
    }
    const confirmed = await this.dialogs.confirm({
      title: `Remove ${member.name} from ${workspaceName}?`,
      body: 'They’ll lose access to every team, channel and file in this workspace right away. Messages and files they’ve already shared stay put.',
      confirmLabel: 'Remove member',
      icon: 'user-minus',
    });
    const workspaceId = this.workspace.currentWorkspaceId();
    const role = confirmed ? await this.admin.removeMember(userId) : null;
    if (!role) {
      return;
    }
    const eventId = this.activity.record({
      kind: 'remove',
      verb: 'removed',
      object: member.name,
      route: MEMBERS_ROUTE,
    });
    this.toasts.show(`${member.name} removed from ${workspaceName}`, {
      icon: 'user-minus',
      actionLabel: 'Undo',
      onAction: () => void this.undoRemove(workspaceId, userId, role, eventId),
    });
  }

  private async applyRole(userId: string, role: WorkspaceRole): Promise<void> {
    const member = this.workspace.user(userId);
    const changed = member ? await this.admin.setRole(userId, role) : false;
    if (!member || !changed) {
      return;
    }
    const withArticle = roleWithArticle(role);
    this.activity.record({
      kind: 'role',
      verb: 'made',
      object: `${member.name} ${withArticle}`,
      route: MEMBERS_ROUTE,
    });
    this.toasts.show(`${member.name} is now ${withArticle}`, { icon: 'shield-check' });
  }

  private async undoRemove(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    eventId: string,
  ): Promise<void> {
    this.activity.remove(eventId);
    await this.admin.restoreMember(userId, role, workspaceId);
  }

  private workspaceName(): string {
    return this.workspace.currentWorkspace()?.name ?? 'this workspace';
  }
}
