import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { TeamCardView } from '../team-view';

@Component({
  selector: 'app-team-table',
  imports: [
    RouterLink,
    AvatarComponent,
    IconButtonComponent,
    IconComponent,
    TableComponent,
    TagComponent,
  ],
  templateUrl: './team-table.component.html',
  styleUrl: './team-table.component.scss',
})
export class TeamTableComponent {
  readonly teams = input.required<readonly TeamCardView[]>();

  readonly manage = output<string>();
  readonly invite = output<string>();
}
