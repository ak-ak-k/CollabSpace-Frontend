import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { StatusDotComponent } from '../../../shared/ui/status-dot/status-dot.component';
import { PeopleActions } from '../people-actions.service';
import { PersonRow } from '../people-page-view';
import { PersonMenuComponent } from '../person-menu/person-menu.component';

@Component({
  selector: 'app-person-card',
  imports: [
    AvatarComponent,
    ButtonComponent,
    IconComponent,
    PersonMenuComponent,
    RouterLink,
    StatusDotComponent,
  ],
  templateUrl: './person-card.component.html',
  styleUrl: './person-card.component.scss',
})
export class PersonCardComponent {
  protected readonly actions = inject(PeopleActions);

  readonly person = input.required<PersonRow>();
}
