import {
  afterNextRender,
  Component,
  computed,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { form, maxLength, required, submit } from '@angular/forms/signals';
import { ToastService } from '../../../core/services/toast.service';
import { PreferencesState } from '../../../core/state/preferences.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ProfileAboutComponent } from '../profile-about/profile-about.component';
import { ProfileDetailsComponent } from '../profile-details/profile-details.component';
import { ProfileHeaderComponent } from '../profile-header/profile-header.component';
import { ProfilePreferencesComponent } from '../profile-preferences/profile-preferences.component';
import { ProfileStatusComponent } from '../profile-status/profile-status.component';
import { ProfileTeamsComponent } from '../profile-teams/profile-teams.component';
import {
  BIO_MAX_LENGTH,
  draftOf,
  ProfileDraft,
  profileDetails,
  profileTeams,
  timeZoneOf,
} from '../profile-view';

const EMPTY_DRAFT: ProfileDraft = {
  name: '',
  title: '',
  bio: '',
  phone: '',
  location: '',
  timeZone: '',
};

@Component({
  selector: 'app-profile-page',
  imports: [
    EmptyStateComponent,
    SkeletonComponent,
    ProfileHeaderComponent,
    ProfileAboutComponent,
    ProfileDetailsComponent,
    ProfileStatusComponent,
    ProfilePreferencesComponent,
    ProfileTeamsComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  host: { '(keydown.escape)': 'cancelEdit()' },
})
export class ProfilePageComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly preferences = inject(PreferencesState);
  private readonly toasts = inject(ToastService);
  private readonly injector = inject(Injector);

  protected readonly status = this.workspace.status;
  protected readonly user = this.workspace.currentUser;
  protected readonly editing = signal(false);
  protected readonly statusMessage = this.preferences.statusMessage;

  private readonly draft = signal<ProfileDraft>(EMPTY_DRAFT);
  protected readonly profileForm = form(
    this.draft,
    (path) => {
      required(path.name, { message: 'Name can’t be empty' });
      maxLength(path.bio, BIO_MAX_LENGTH);
    },
    {
      submission: {
        action: async () => this.save(),
        onInvalid: (submitted) => submitted().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  protected readonly details = computed(() => {
    const user = this.user();
    if (!user) {
      return [];
    }
    const twentyFourHour = this.preferences.preferences().timeFormat === '24-hour';
    return profileDetails(user, this.manager(), twentyFourHour);
  });
  protected readonly teams = computed(() =>
    profileTeams(this.workspace.joinedTeams(), this.user()?.id ?? ''),
  );

  private readonly header = viewChild(ProfileHeaderComponent);
  private readonly about = viewChild(ProfileAboutComponent);

  private readonly manager = computed(() => {
    const userId = this.user()?.id;
    const team = this.workspace.joinedTeams().find((candidate) => candidate.leadId !== userId);
    return this.workspace.user(team?.leadId ?? null);
  });

  protected startEdit(): void {
    const user = this.user();
    if (!user) {
      return;
    }
    this.draft.set(draftOf(user));
    this.profileForm().reset();
    this.editing.set(true);
    this.afterRender(() => this.about()?.focusName());
  }

  protected cancelEdit(): void {
    if (this.editing()) {
      this.editing.set(false);
      this.afterRender(() => this.header()?.focusEdit());
    }
  }

  protected saveChanges(): void {
    void submit(this.profileForm);
  }

  protected changePhoto(): void {
    this.toasts.show('Photo upload opens your file picker in the live product', {
      icon: 'upload',
    });
  }

  protected reload(): void {
    void this.workspace.reload();
  }

  private afterRender(action: () => void): void {
    afterNextRender(action, { injector: this.injector });
  }

  private async save(): Promise<void> {
    const draft = this.draft();
    const zone = timeZoneOf(draft.timeZone);
    await this.workspace.updateProfile({
      name: draft.name.trim(),
      title: draft.title.trim(),
      bio: draft.bio.trim(),
      phone: draft.phone.trim(),
      location: draft.location.trim(),
      timeZone: draft.timeZone,
      timeZoneLabel: zone?.shortLabel ?? this.user()?.timeZoneLabel ?? '',
    });
    this.toasts.show('Profile updated', { icon: 'circle-check' });
    this.editing.set(false);
    this.afterRender(() => this.header()?.focusEdit());
  }
}
