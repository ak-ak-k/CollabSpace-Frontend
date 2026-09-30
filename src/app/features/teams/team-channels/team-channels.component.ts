import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { ChannelRowView } from '../team-view';
import { CountPipe } from '../../../shared/pipes/count.pipe';

@Component({
  selector: 'app-team-channels',
  imports: [CountPipe, RouterLink, ButtonComponent, IconComponent, TagComponent],
  templateUrl: './team-channels.component.html',
  styleUrl: './team-channels.component.scss',
})
export class TeamChannelsComponent {
  readonly channels = input.required<readonly ChannelRowView[]>();
  readonly createChannel = output<void>();
}
