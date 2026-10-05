import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, validate } from '@angular/forms/signals';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { MemberPickerComponent } from '../new-group-dialog/member-picker/member-picker.component';

export interface AddPeopleDialogData {
  readonly title: string;
  readonly description: string;
  readonly excludeIds: readonly string[];
  readonly confirmLabel: string;
}

export type AddPeopleDialogResult = readonly string[];

interface PeopleDraft {
  readonly memberIds: string[];
}

@Component({
  selector: 'app-add-people-dialog',
  imports: [
    FormField,
    FormRoot,
    ModalComponent,
    MemberPickerComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './add-people-dialog.component.html',
  styleUrl: './add-people-dialog.component.scss',
})
export class AddPeopleDialogComponent {
  private readonly dialogRef = inject<DialogRef<AddPeopleDialogResult>>(DialogRef);
  private readonly workspace = inject(WorkspaceState);
  protected readonly data = inject<AddPeopleDialogData>(DIALOG_DATA);

  protected readonly people = computed(() => {
    const excluded = new Set([...this.data.excludeIds, this.workspace.currentUser()?.id ?? '']);
    return this.workspace.members().filter((user) => !excluded.has(user.id));
  });

  private readonly draft = signal<PeopleDraft>({ memberIds: [] });

  protected readonly submitLabel = computed(() => {
    const count = this.draft().memberIds.length;
    return count > 1 ? `Add ${count} people` : this.data.confirmLabel;
  });

  protected readonly peopleForm = form(
    this.draft,
    (path) => {
      validate(path.memberIds, ({ value }) =>
        value().length === 0
          ? { kind: 'minMembers', message: 'Pick at least one person.' }
          : undefined,
      );
    },
    {
      submission: {
        action: async () => this.dialogRef.close(this.draft().memberIds),
        onInvalid: (submitted) => submitted().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected cancel(): void {
    this.dialogRef.close([]);
  }
}
