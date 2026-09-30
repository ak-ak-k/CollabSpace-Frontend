import { Component, signal } from '@angular/core';
import { email, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../../../shared/ui/checkbox/checkbox.component';
import { InputComponent } from '../../../../../shared/ui/input/input.component';
import { PasswordStrengthComponent } from '../../../../../shared/ui/input/password-strength/password-strength.component';
import { PASSWORD_MIN_LENGTH } from '../../../../../shared/ui/input/password-strength/password-strength';

interface SignupModel {
  readonly email: string;
  readonly password: string;
  readonly acceptTerms: boolean;
}

const EMPTY_SIGNUP: SignupModel = { email: '', password: '', acceptTerms: false };

@Component({
  selector: 'app-styleguide-signup-form-example',
  imports: [
    FormField,
    FormRoot,
    ButtonComponent,
    CheckboxComponent,
    InputComponent,
    PasswordStrengthComponent,
  ],
  templateUrl: './signup-form-example.component.html',
  styleUrl: './signup-form-example.component.scss',
})
export class SignupFormExampleComponent {
  protected readonly createdFor = signal('');

  private readonly signup = signal<SignupModel>(EMPTY_SIGNUP);

  protected readonly signupForm = form(
    this.signup,
    (path) => {
      required(path.email, { message: 'Enter your email address.' });
      email(path.email, { message: 'That doesn’t look like an email address.' });
      required(path.password, { message: 'Enter your password.' });
      minLength(path.password, PASSWORD_MIN_LENGTH, { message: 'Use at least 8 characters.' });
      required(path.acceptTerms, { message: 'Please accept the terms to continue.' });
    },
    {
      submission: {
        action: async (submitted) => this.createdFor.set(submitted.email().value()),
        onInvalid: (submitted) => {
          this.createdFor.set('');
          submitted().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );
}
