import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ProfileTeamView } from '../profile-view';

@Component({
  selector: 'app-profile-teams',
  imports: [RouterLink, AvatarComponent],
  templateUrl: './profile-teams.component.html',
  styleUrl: './profile-teams.component.scss',
})
export class ProfileTeamsComponent {
  readonly teams = input<readonly ProfileTeamView[]>([]);
}
