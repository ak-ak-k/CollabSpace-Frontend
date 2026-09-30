import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { TextareaComponent } from '../../../../../shared/ui/textarea/textarea.component';

interface GroupModel {
  readonly name: string;
  readonly purpose: string;
}

const EMPTY_GROUP: GroupModel = { name: '', purpose: '' };

@Component({
  selector: 'app-styleguide-demo-form-dialog',
  imports: [
    FormField,
    FormRoot,
    ButtonComponent,
    IconComponent,
    InputComponent,
    ModalComponent,
    TextareaComponent,
  ],
  templateUrl: './demo-form-dialog.component.html',
  styleUrl: './demo-form-dialog.component.scss',
})
export class DemoFormDialogComponent {
  private readonly dialogRef = inject<DialogRef<string>>(DialogRef);
  private readonly group = signal<GroupModel>(EMPTY_GROUP);

  protected readonly groupForm = form(
    this.group,
    (path) => {
      required(path.name, { message: 'Give the group a name.' });
    },
    {
      submission: {
        action: async (submitted) => this.dialogRef.close(submitted.name().value()),
        onInvalid: (submitted) => submitted().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected cancel(): void {
    this.dialogRef.close();
  }
}
