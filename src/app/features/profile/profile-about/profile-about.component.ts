import { booleanAttribute, Component, input, viewChild } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { BIO_MAX_LENGTH, ProfileDraft } from '../profile-view';

@Component({
  selector: 'app-profile-about',
  imports: [FormField, InputComponent, TextareaComponent],
  templateUrl: './profile-about.component.html',
  styleUrl: './profile-about.component.scss',
})
export class ProfileAboutComponent {
  readonly bio = input('');
  readonly editing = input(false, { transform: booleanAttribute });
  readonly form = input.required<FieldTree<ProfileDraft>>();

  protected readonly bioMaxLength = BIO_MAX_LENGTH;

  private readonly nameField = viewChild(InputComponent);

  focusName(): void {
    this.nameField()?.focus();
  }
}
