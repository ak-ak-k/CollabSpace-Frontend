import { Component, computed, input, output } from '@angular/core';
import { PluralPipe } from '../../../shared/pipes/plural.pipe';
import { RouterLink } from '@angular/router';
import { AvatarGroupComponent } from '../../../shared/ui/avatar-group/avatar-group.component';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { TeamCardView } from '../team-view';

const CARD_STACK_SIZE = 4;

@Component({
  selector: 'app-team-card',
  imports: [
    PluralPipe,
    RouterLink,
    AvatarComponent,
    AvatarGroupComponent,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    TagComponent,
  ],
  templateUrl: './team-card.component.html',
  styleUrl: './team-card.component.scss',
})
export class TeamCardComponent {
  readonly team = input.required<TeamCardView>();

  readonly join = output<void>();
  readonly manage = output<void>();
  readonly invite = output<void>();

  protected readonly stackSize = CARD_STACK_SIZE;
  protected readonly link = computed(() => ['/teams', this.team().id]);
}
