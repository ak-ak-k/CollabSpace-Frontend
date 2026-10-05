import { booleanAttribute, Component, inject, input } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { StatusDotComponent } from '../../../shared/ui/status-dot/status-dot.component';
import { PeopleActions } from '../people-actions.service';
import { PersonRow } from '../people-page-view';
import { PersonMenuComponent } from '../person-menu/person-menu.component';

@Component({
  selector: 'app-person-row',
  imports: [
    AvatarComponent,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    PersonMenuComponent,
    StatusDotComponent,
  ],
  templateUrl: './person-row.component.html',
  styleUrl: './person-row.component.scss',
})
export class PersonRowComponent {
  protected readonly actions = inject(PeopleActions);

  readonly person = input.required<PersonRow>();
  readonly wide = input(false, { transform: booleanAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
}
