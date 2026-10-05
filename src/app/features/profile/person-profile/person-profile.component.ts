import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { teamsOfPerson } from '../../../core/state/people-view';
import { PreferencesState } from '../../../core/state/preferences.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { PersonActions } from '../../../shared/components/person-panel/person-actions.service';
import { PersonActivityListComponent } from '../../../shared/components/person-panel/person-activity-list/person-activity-list.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ProfileAboutComponent } from '../profile-about/profile-about.component';
import { ProfileDetailsComponent } from '../profile-details/profile-details.component';
import { ProfileHeaderComponent } from '../profile-header/profile-header.component';
import { ProfileTeamsComponent } from '../profile-teams/profile-teams.component';
import { personDetails, profileTeams } from '../profile-view';

const PEOPLE_ROUTE = '/people';

@Component({
  selector: 'app-person-profile',
  imports: [
    EmptyStateComponent,
    PersonActivityListComponent,
    ProfileAboutComponent,
    ProfileDetailsComponent,
    ProfileHeaderComponent,
    ProfileTeamsComponent,
    SkeletonComponent,
  ],
  templateUrl: './person-profile.component.html',
  styleUrl: './person-profile.component.scss',
})
export class PersonProfileComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly preferences = inject(PreferencesState);
  private readonly actions = inject(PersonActions);
  private readonly router = inject(Router);

  readonly userId = input.required<string>();

  protected readonly status = this.workspace.status;
  protected readonly person = computed(() => {
    const isMember = this.workspace.memberIds().has(this.userId());
    return isMember ? this.workspace.user(this.userId()) : null;
  });
  protected readonly showsPerson = computed(
    () => this.status() !== 'loading' && this.status() !== 'error' && !!this.person(),
  );
  protected readonly details = computed(() => {
    const person = this.person();
    const twentyFourHour = this.preferences.preferences().timeFormat === '24-hour';
    return person ? personDetails(person, twentyFourHour) : [];
  });
  protected readonly teams = computed(() =>
    profileTeams(teamsOfPerson(this.userId(), this.workspace.teams()), this.userId()),
  );

  protected message(): void {
    void this.actions.message(this.userId());
  }

  protected goToPeople(): void {
    void this.router.navigateByUrl(PEOPLE_ROUTE);
  }

  protected reload(): void {
    void this.workspace.reload();
  }
}
