import { DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, FormRoot, maxLength, required, validate } from '@angular/forms/signals';
import { ConnectionGuard } from '../../../core/services/connection-guard.service';
import { ToastService } from '../../../core/services/toast.service';
import { ChatState } from '../../../core/state/chat.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { MemberPickerComponent } from './member-picker/member-picker.component';

interface GroupDraft {
  readonly name: string;
  readonly memberIds: string[];
}

const GROUP_NAME_MAX_LENGTH = 60;
const MIN_GROUP_MEMBERS = 2;

const membersError = (count: number): string | null => {
  if (count >= MIN_GROUP_MEMBERS) {
    return null;
  }
  return count === 1
    ? 'Pick at least two people — for one person, start a direct message.'
    : 'Pick at least two people.';
};

@Component({
  selector: 'app-new-group-dialog',
  imports: [
    FormField,
    FormRoot,
    ModalComponent,
    InputComponent,
    MemberPickerComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './new-group-dialog.component.html',
  styleUrl: './new-group-dialog.component.scss',
})
export class NewGroupDialogComponent {
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);
  private readonly chat = inject(ChatState);
  private readonly workspace = inject(WorkspaceState);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly connection = inject(ConnectionGuard);

  protected readonly nameMaxLength = GROUP_NAME_MAX_LENGTH;
  protected readonly people = computed(() =>
    this.workspace.members().filter((user) => user.id !== this.workspace.currentUser()?.id),
  );

  private readonly draft = signal<GroupDraft>({ name: '', memberIds: [] });

  protected readonly groupForm = form(
    this.draft,
    (path) => {
      required(path.name, { message: 'Give the group a name.' });
      maxLength(path.name, GROUP_NAME_MAX_LENGTH);
      validate(path.memberIds, ({ value }) => {
        const message = membersError(value().length);
        return message ? { kind: 'minMembers', message } : undefined;
      });
    },
    {
      submission: {
        action: async () => {
          if (this.connection.allowsSave()) {
            await this.createGroup();
          }
        },
        onInvalid: (submitted) => submitted().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected cancel(): void {
    this.dialogRef.close();
  }

  private async createGroup(): Promise<void> {
    const name = this.draft().name.trim();
    const memberIds = this.draft().memberIds;
    const conversationId = await this.chat.createGroup(name, memberIds);
    this.dialogRef.close();
    await this.router.navigate(['/messages', conversationId]);
    this.toasts.show(`Group “${name}” created with ${memberIds.length} people`, { icon: 'users' });
  }
}
