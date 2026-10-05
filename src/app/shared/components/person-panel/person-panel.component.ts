import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { AvatarComponent } from '../../ui/avatar/avatar.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { IconButtonComponent } from '../../ui/icon-button/icon-button.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { labelEnclosingDialog } from '../../ui/modal/dialog-container/dialog-label';
import { createOverlayId } from '../../ui/modal/overlay-id';
import { StatusDotComponent } from '../../ui/status-dot/status-dot.component';
import { TagComponent } from '../../ui/tag/tag.component';
import { PersonActions } from './person-actions.service';
import { PersonActivityListComponent } from './person-activity-list/person-activity-list.component';
import { personTeamsOf, personViewOf } from './person-panel-view';

export interface PersonPanelData {
  readonly userId: string;
  readonly canChangeRole: boolean;
}

export type PersonPanelResult = 'message' | 'role';

@Component({
  selector: 'app-person-panel',
  imports: [
    AvatarComponent,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    PersonActivityListComponent,
    RouterLink,
    StatusDotComponent,
    TagComponent,
  ],
  templateUrl: './person-panel.component.html',
  styleUrl: './person-panel.component.scss',
})
export class PersonPanelComponent {
  private readonly dialogRef = inject<DialogRef<PersonPanelResult>>(DialogRef);
  private readonly data = inject<PersonPanelData>(DIALOG_DATA);
  private readonly workspace = inject(WorkspaceState);
  private readonly actions = inject(PersonActions);

  protected readonly titleId = createOverlayId('person-panel-name');
  protected readonly aboutId = createOverlayId('person-panel-about');
  protected readonly teamsId = createOverlayId('person-panel-teams');
  protected readonly activityId = createOverlayId('person-panel-activity');
  protected readonly canChangeRole = this.data.canChangeRole;

  protected readonly person = computed(() => {
    const user = this.workspace.user(this.data.userId);
    const isMember = this.workspace.memberIds().has(this.data.userId);
    const viewerId = this.workspace.currentUser()?.id ?? '';
    return user && isMember ? personViewOf(user, viewerId) : null;
  });
  protected readonly teams = computed(() =>
    personTeamsOf(this.data.userId, this.workspace.teams()),
  );

  constructor() {
    labelEnclosingDialog(this.titleId);
  }

  protected copyEmail(email: string): void {
    this.actions.copyEmail(email);
  }

  protected close(result?: PersonPanelResult): void {
    this.dialogRef.close(result);
  }
}
