import { booleanAttribute, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { ProfileDetail, ProfileDraft, TIME_ZONE_OPTIONS } from '../profile-view';

@Component({
  selector: 'app-profile-details',
  imports: [FormField, InputComponent, SelectComponent],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
})
export class ProfileDetailsComponent {
  readonly details = input<readonly ProfileDetail[]>([]);
  readonly editing = input(false, { transform: booleanAttribute });
  readonly form = input.required<FieldTree<ProfileDraft>>();

  protected readonly timeZoneOptions = TIME_ZONE_OPTIONS;
}
