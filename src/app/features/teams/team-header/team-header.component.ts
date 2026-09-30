import { Component, input, output } from '@angular/core';
import { Team } from '../../../core/models/team';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { CountPipe } from '../../../shared/pipes/count.pipe';

@Component({
  selector: 'app-team-header',
  imports: [CountPipe, AvatarComponent, ButtonComponent, IconComponent, TagComponent],
  templateUrl: './team-header.component.html',
  styleUrl: './team-header.component.scss',
})
export class TeamHeaderComponent {
  readonly team = input.required<Team>();

  readonly invite = output<void>();
  readonly manage = output<void>();
  readonly join = output<void>();
  readonly leave = output<void>();
}
