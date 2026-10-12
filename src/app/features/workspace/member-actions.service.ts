import { DialogRef } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceRole } from '../../core/models/user';
import { roleWithArticle } from '../../core/models/workspace-role';
import { ConnectionGuard } from '../../core/services/connection-guard.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkspaceAdminState } from '../../core/state/workspace-admin.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { PersonActions } from '../../shared/components/person-panel/person-actions.service';
import { PersonPanelService } from '../../shared/components/person-panel/person-panel.service';
import {
  ChangeRoleDialogComponent,
  ChangeRoleDialogData,
} from './change-role-dialog/change-role-dialog.component';
import {
  MemberActionsSheetComponent,
  MemberActionsSheetData,
} from './member-actions-sheet/member-actions-sheet.component';
import {
  canChangeMember,
  MemberActionKind,
  MemberMenuItem,
  memberMenuItems,
} from './member-actions-view';
import { MemberRow } from './members-view';

const PROFILE_ROUTE = '/profile';

@Service()
export class MemberActions {
  private readonly workspace = inject(WorkspaceState);
  private readonly admin = inject(WorkspaceAdminState);
  private readonly people = inject(PersonActions);
  private readonly personPanel = inject(PersonPanelService);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);
  private readonly connection = inject(ConnectionGuard);

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
    const onChangeRole = this.canChange(userId) ? () => this.changeRole(userId) : undefined;
    this.personPanel.open(userId, { onChangeRole });
  }

  changeRole(userId: string): void {
    const dialog = this.dialogs.open<WorkspaceRole, ChangeRoleDialogData>(
      ChangeRoleDialogComponent,
      { data: { userId }, size: 'md' },
    );
    dialog.closed.subscribe((role) => role && void this.applyRole(userId, role));
  }

  message(userId: string): Promise<void> {
    return this.people.message(userId);
  }

  async remove(userId: string): Promise<void> {
    const member = this.workspace.user(userId);
    const workspaceName = this.workspaceName();
    if (!member || !this.connection.allows('removeMember')) {
      return;
    }
    const confirmed = await this.dialogs.confirm({
      title: `Remove ${member.name} from ${workspaceName}?`,
      body: 'They’ll lose access to every team, channel and file in this workspace right away. Messages and files they’ve already shared stay put.',
      confirmLabel: 'Remove member',
      icon: 'user-minus',
      canConfirm: this.connection.recheck('removeMember'),
    });
    const workspaceId = this.workspace.currentWorkspaceId();
    const role = confirmed ? await this.admin.removeMember(userId) : null;
    if (!role) {
      return;
    }
    this.toasts.show(`${member.name} removed from ${workspaceName}`, {
      icon: 'user-minus',
      actionLabel: 'Undo',
      onAction: () => void this.admin.restoreMember(userId, role, workspaceId),
    });
  }

  private async applyRole(userId: string, role: WorkspaceRole): Promise<void> {
    const member = this.workspace.user(userId);
    const changed = member ? await this.admin.setRole(userId, role) : false;
    if (!member || !changed) {
      return;
    }
    this.toasts.show(`${member.name} is now ${roleWithArticle(role)}`, { icon: 'shield-check' });
  }

  private workspaceName(): string {
    return this.workspace.currentWorkspace()?.name ?? 'this workspace';
  }
}
