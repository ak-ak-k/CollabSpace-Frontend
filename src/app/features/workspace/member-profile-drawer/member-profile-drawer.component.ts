import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceAdminState } from '../../../core/state/workspace-admin.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { labelEnclosingDialog } from '../../../shared/ui/modal/dialog-container/dialog-label';
import { createOverlayId } from '../../../shared/ui/modal/overlay-id';
import { StatusDotComponent } from '../../../shared/ui/status-dot/status-dot.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { canChangeMember, memberProfileOf, memberTeamsOf } from '../member-actions-view';

export interface MemberProfileDrawerData {
  readonly userId: string;
}

export type MemberProfileDrawerResult = 'message' | 'role';

@Component({
  selector: 'app-member-profile-drawer',
  imports: [
    AvatarComponent,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    RouterLink,
    StatusDotComponent,
    TagComponent,
  ],
  templateUrl: './member-profile-drawer.component.html',
  styleUrl: './member-profile-drawer.component.scss',
})
export class MemberProfileDrawerComponent {
  private readonly dialogRef = inject<DialogRef<MemberProfileDrawerResult>>(DialogRef);
  private readonly data = inject<MemberProfileDrawerData>(DIALOG_DATA);
  private readonly workspace = inject(WorkspaceState);
  private readonly admin = inject(WorkspaceAdminState);

  protected readonly titleId = createOverlayId('member-profile-name');
  protected readonly teamsHeadingId = createOverlayId('member-profile-teams');

  private readonly user = computed(() => this.workspace.user(this.data.userId));
  protected readonly profile = computed(() => {
    const user = this.user();
    const viewerId = this.workspace.currentUser()?.id ?? '';
    return user ? memberProfileOf(user, viewerId) : null;
  });
  protected readonly teams = computed(() =>
    memberTeamsOf(this.data.userId, this.workspace.teams()),
  );
  protected readonly workspaceName = computed(
    () => this.workspace.currentWorkspace()?.name ?? 'this workspace',
  );
  protected readonly canChangeRole = computed(() => {
    const user = this.user();
    return (
      !!user && canChangeMember(this.workspace.access(), user.role, this.admin.canRemove(user.id))
    );
  });

  constructor() {
    labelEnclosingDialog(this.titleId);
  }

  protected close(result?: MemberProfileDrawerResult): void {
    this.dialogRef.close(result);
  }
}
