import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  maxLength,
  submit,
  validate,
  ValidationError,
} from '@angular/forms/signals';
import {
  slugify,
  WORKSPACE_DESCRIPTION_MAX_LENGTH,
  WORKSPACE_NAME_MAX_LENGTH,
  WORKSPACE_SLUG_MAX_LENGTH,
  WORKSPACE_URL_SUFFIX,
  workspaceNameError,
  workspaceSlugError,
} from '../../../core/models/workspace-rules';
import { ConnectionGuard } from '../../../core/services/connection-guard.service';
import { WorkspaceAdminState } from '../../../core/state/workspace-admin.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { WorkspaceActions } from '../workspace-actions.service';
import { WorkspaceUrlFieldComponent } from './workspace-url-field/workspace-url-field.component';

interface WorkspaceDraft {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
}

const asError = (kind: string, message: string): ValidationError | undefined =>
  message ? { kind, message } : undefined;

@Component({
  selector: 'app-create-workspace-dialog',
  imports: [
    FormField,
    ModalComponent,
    InputComponent,
    WorkspaceUrlFieldComponent,
    TextareaComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: './create-workspace-dialog.component.html',
  styleUrl: './create-workspace-dialog.component.scss',
})
export class CreateWorkspaceDialogComponent {
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);
  private readonly admin = inject(WorkspaceAdminState);
  private readonly actions = inject(WorkspaceActions);
  private readonly connection = inject(ConnectionGuard);

  protected readonly nameMaxLength = WORKSPACE_NAME_MAX_LENGTH;
  protected readonly slugMaxLength = WORKSPACE_SLUG_MAX_LENGTH;
  protected readonly descriptionMaxLength = WORKSPACE_DESCRIPTION_MAX_LENGTH;
  protected readonly urlSuffix = WORKSPACE_URL_SUFFIX;

  private readonly attempted = signal(false);
  private readonly slugEdited = signal(false);
  private readonly draft = signal<WorkspaceDraft>({ name: '', slug: '', description: '' });

  protected readonly workspaceForm = form(this.draft, (path) => {
    maxLength(path.name, WORKSPACE_NAME_MAX_LENGTH);
    maxLength(path.slug, WORKSPACE_SLUG_MAX_LENGTH);
    maxLength(path.description, WORKSPACE_DESCRIPTION_MAX_LENGTH);
    validate(path.name, ({ value }) =>
      this.attempted() ? asError('workspaceName', workspaceNameError(value())) : undefined,
    );
    validate(path.slug, ({ value }) =>
      this.attempted()
        ? asError(
            'workspaceSlug',
            workspaceSlugError(value(), (slug) => this.admin.isSlugInUse(slug)),
          )
        : undefined,
    );
  });

  protected followName(name: string): void {
    if (!this.slugEdited()) {
      this.workspaceForm.slug().value.set(slugify(name));
    }
  }

  protected markSlugEdited(): void {
    this.slugEdited.set(true);
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected async create(event: Event): Promise<void> {
    event.preventDefault();
    this.attempted.set(true);
    await submit(this.workspaceForm, {
      action: async () => this.finish(),
      onInvalid: (submitted) => submitted().errorSummary()[0]?.fieldTree().focusBoundControl(),
    });
  }

  private finish(): void {
    if (!this.connection.allowsSave()) {
      return;
    }
    const { name, slug, description } = this.draft();
    this.dialogRef.close();
    void this.actions.createWorkspace({
      name: name.trim(),
      slug,
      description: description.trim(),
    });
  }
}
