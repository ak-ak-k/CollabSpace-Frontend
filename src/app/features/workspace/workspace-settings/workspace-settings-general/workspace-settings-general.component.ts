import { Component, computed, inject, linkedSignal } from '@angular/core';
import { form, FormField, submit, validate, ValidationError } from '@angular/forms/signals';
import {
  WORKSPACE_DESCRIPTION_MAX_LENGTH,
  WORKSPACE_NAME_MAX_LENGTH,
  WORKSPACE_URL_SUFFIX,
  workspaceNameError,
  workspaceSlugError,
} from '../../../../core/models/workspace-rules';
import { ConnectionGuard } from '../../../../core/services/connection-guard.service';
import { ToastService } from '../../../../core/services/toast.service';
import { WorkspaceAdminState } from '../../../../core/state/workspace-admin.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import { TextareaComponent } from '../../../../shared/ui/textarea/textarea.component';
import { focusFirstInvalid } from '../../../settings/settings-forms';
import { SettingsUrlFieldComponent } from '../../../settings/settings-url-field/settings-url-field.component';
import { WorkspaceLogoFieldComponent } from '../workspace-logo-field/workspace-logo-field.component';

interface GeneralDraft {
  readonly name: string;
  readonly description: string;
  readonly slug: string;
  readonly defaultChannelId: string;
}

const NO_DEFAULT_CHANNEL: SelectOption = { value: '', label: 'None' };

const sameDraft = (first: GeneralDraft, second: GeneralDraft): boolean =>
  first.name === second.name &&
  first.description === second.description &&
  first.slug === second.slug &&
  first.defaultChannelId === second.defaultChannelId;

@Component({
  selector: 'app-workspace-settings-general',
  imports: [
    FormField,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    SettingsUrlFieldComponent,
    TextareaComponent,
    WorkspaceLogoFieldComponent,
  ],
  templateUrl: './workspace-settings-general.component.html',
  styleUrl: './workspace-settings-general.component.scss',
})
export class WorkspaceSettingsGeneralComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly admin = inject(WorkspaceAdminState);
  private readonly toasts = inject(ToastService);
  private readonly connection = inject(ConnectionGuard);

  private readonly saved = computed<GeneralDraft>(
    () => {
      const current = this.workspace.currentWorkspace();
      return {
        name: current?.name ?? '',
        description: current?.description ?? '',
        slug: current?.slug ?? '',
        defaultChannelId: this.workspace.preferences()?.defaultChannelId ?? '',
      };
    },
    { equal: sameDraft },
  );
  private readonly draft = linkedSignal(() => this.saved());
  private readonly attempted = linkedSignal({ source: this.saved, computation: () => false });

  protected readonly nameMaxLength = WORKSPACE_NAME_MAX_LENGTH;
  protected readonly descriptionMaxLength = WORKSPACE_DESCRIPTION_MAX_LENGTH;
  protected readonly urlSuffix = WORKSPACE_URL_SUFFIX;
  protected readonly dirty = computed(() => !sameDraft(this.draft(), this.saved()));
  protected readonly descriptionHint = computed(
    () =>
      `${this.draft().description.length} / ${WORKSPACE_DESCRIPTION_MAX_LENGTH} · Shown on the workspace overview and in invitations.`,
  );
  protected readonly channelOptions = computed<readonly SelectOption[]>(() => [
    NO_DEFAULT_CHANNEL,
    ...this.workspace
      .channels()
      .filter((channel) => !channel.isPrivate)
      .map((channel) => {
        const team = this.workspace.team(channel.teamId);
        return { value: channel.id, label: `#${channel.name}${team ? ` · ${team.name}` : ''}` };
      }),
  ]);

  protected readonly generalForm = form(this.draft, (path) => {
    validate(path.name, ({ value }) =>
      this.errorOnceAttempted('workspaceName', workspaceNameError(value())),
    );
    validate(path.slug, ({ value }) =>
      this.errorOnceAttempted(
        'workspaceSlug',
        workspaceSlugError(value(), (slug) => this.admin.isSlugTaken(slug)),
      ),
    );
  });

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.dirty() || !this.connection.allowsSave()) {
      return;
    }
    this.attempted.set(true);
    await submit(this.generalForm, {
      action: async () => this.save(),
      onInvalid: focusFirstInvalid,
    });
  }

  protected discard(): void {
    this.draft.set(this.saved());
    this.attempted.set(false);
    this.generalForm().reset();
  }

  private errorOnceAttempted(kind: string, message: string): ValidationError | undefined {
    return this.attempted() && message ? { kind, message } : undefined;
  }

  private async save(): Promise<void> {
    const draft = this.draft();
    const channelChanged = draft.defaultChannelId !== this.saved().defaultChannelId;
    const updates = [
      this.admin.updateWorkspace({
        name: draft.name.trim(),
        description: draft.description.trim(),
        slug: draft.slug,
      }),
    ];
    if (channelChanged) {
      updates.push(this.admin.updatePreferences({ defaultChannelId: draft.defaultChannelId }));
    }
    this.generalForm().reset();
    this.toasts.show('Workspace settings saved', { icon: 'circle-check' });
    await Promise.all(updates);
  }
}
