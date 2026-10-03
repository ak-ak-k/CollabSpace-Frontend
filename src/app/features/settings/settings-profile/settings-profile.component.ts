import { Component, computed, inject, linkedSignal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { userColorSeed } from '../../../core/models/user';
import { ToastService } from '../../../core/services/toast.service';
import { PreferencesState } from '../../../core/state/preferences.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { focusFirstInvalid } from '../settings-forms';

interface ProfileDraft {
  readonly displayName: string;
  readonly pronouns: string;
}

@Component({
  selector: 'app-settings-profile',
  imports: [
    FormField,
    FormRoot,
    RouterLink,
    AvatarComponent,
    ButtonComponent,
    CardComponent,
    IconComponent,
    InputComponent,
  ],
  templateUrl: './settings-profile.component.html',
  styleUrl: './settings-profile.component.scss',
})
export class SettingsProfileComponent {
  private readonly preferences = inject(PreferencesState);
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);

  private readonly displayName = computed(() => this.preferences.preferences().displayName);
  private readonly pronouns = computed(() => this.preferences.preferences().pronouns);
  private readonly draft = linkedSignal<ProfileDraft>(() => ({
    displayName: this.displayName(),
    pronouns: this.pronouns(),
  }));

  protected readonly user = this.workspace.currentUser;
  protected readonly colorSeedOf = userColorSeed;

  protected readonly profileForm = form(
    this.draft,
    (path) => {
      required(path.displayName, { message: 'Enter a display name.' });
    },
    {
      submission: {
        action: async () => this.save(),
        onInvalid: focusFirstInvalid,
      },
    },
  );

  private save(): void {
    const { displayName, pronouns } = this.draft();
    void this.preferences.update({ displayName: displayName.trim(), pronouns: pronouns.trim() });
    this.toasts.show('Profile settings saved', { icon: 'circle-check' });
  }
}
