import { Component, signal } from '@angular/core';
import { InputComponent } from '../../../../../shared/ui/input/input.component';
import { PasswordStrengthComponent } from '../../../../../shared/ui/input/password-strength/password-strength.component';
import { SearchInputComponent } from '../../../../../shared/ui/search-input/search-input.component';
import { SelectComponent } from '../../../../../shared/ui/select/select.component';
import { TextareaComponent } from '../../../../../shared/ui/textarea/textarea.component';
import { TEAM_OPTIONS } from '../forms-demo-options';

const NOTE_MAX_LENGTH = 280;

@Component({
  selector: 'app-styleguide-text-fields-demo',
  imports: [
    InputComponent,
    PasswordStrengthComponent,
    SearchInputComponent,
    SelectComponent,
    TextareaComponent,
  ],
  templateUrl: './text-fields-demo.component.html',
  styleUrl: './text-fields-demo.component.scss',
})
export class TextFieldsDemoComponent {
  protected readonly teamOptions = TEAM_OPTIONS;
  protected readonly noteMaxLength = NOTE_MAX_LENGTH;

  protected readonly title = signal('');
  protected readonly password = signal('');
  protected readonly note = signal('Hey! We’re moving our team chat to CollabSpace.');
  protected readonly team = signal('atlas');
  protected readonly unpickedTeam = signal('');
  protected readonly query = signal('');
  protected readonly filledQuery = signal('Aarav');
}
