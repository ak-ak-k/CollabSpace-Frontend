import { Component, inject, input, signal } from '@angular/core';
import { PRESENCE_OPTIONS, PresenceStatus, User } from '../../../core/models/user';
import { ToastService } from '../../../core/services/toast.service';
import { PreferencesState } from '../../../core/state/preferences.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';

const STATUS_OPTIONS: readonly RadioOption[] = PRESENCE_OPTIONS.map((option) => ({
  value: option.status,
  label: option.label,
  swatch: `var(--status-${option.status})`,
}));

@Component({
  selector: 'app-profile-status',
  imports: [ButtonComponent, InputComponent, RadioGroupComponent],
  templateUrl: './profile-status.component.html',
  styleUrl: './profile-status.component.scss',
})
export class ProfileStatusComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly preferences = inject(PreferencesState);
  private readonly toasts = inject(ToastService);

  readonly user = input.required<User>();

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly messageDraft = signal('');

  protected async setStatus(value: string): Promise<void> {
    const option = PRESENCE_OPTIONS.find((candidate) => candidate.status === value);
    if (!option || option.status === this.user().status) {
      return;
    }
    await this.workspace.setPresence(option.status satisfies PresenceStatus);
    void this.preferences.update({ doNotDisturb: option.status === 'dnd' });
    this.toasts.show(`Status set to ${option.label}`, { icon: 'circle-check' });
  }

  protected async setMessage(event: Event): Promise<void> {
    event.preventDefault();
    const statusMessage = this.messageDraft().trim();
    this.messageDraft.set('');
    await this.preferences.update({ statusMessage });
    this.toasts.show(statusMessage ? 'Status message set' : 'Status message cleared', {
      icon: 'circle-check',
    });
  }
}
