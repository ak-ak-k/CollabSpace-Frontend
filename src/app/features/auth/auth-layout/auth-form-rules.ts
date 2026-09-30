import {
  apply,
  FieldTree,
  minLength,
  required,
  schema,
  validate,
  ValidationError,
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import { MINIMUM_PASSWORD_LENGTH } from '../../../core/state/auth.state';

export interface PasswordPair {
  readonly password: string;
  readonly confirmPassword: string;
}

interface CarriedEmail {
  readonly email: string;
}

export const HOME_URL = '/home';
export const LOGIN_URL = '/login';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
const MINIMUM_NAME_LENGTH = 2;
const PASSWORD_MISMATCH_MESSAGE = 'Passwords don’t match.';

const emailFormatError = (email: string): ValidationError | undefined =>
  email === '' || EMAIL_PATTERN.test(email.trim())
    ? undefined
    : { kind: 'emailFormat', message: 'That doesn’t look like an email address.' };

const tooShortError = (text: string, message: string): ValidationError | undefined =>
  text === '' || text.trim().length >= MINIMUM_NAME_LENGTH
    ? undefined
    : { kind: 'tooShort', message };

const mismatchError = (confirmation: string, password: string): ValidationError | undefined =>
  confirmation === '' || confirmation === password
    ? undefined
    : { kind: 'passwordMismatch', message: PASSWORD_MISMATCH_MESSAGE };

const carriesEmail = (state: unknown): state is CarriedEmail =>
  typeof state === 'object' &&
  state !== null &&
  'email' in state &&
  typeof state.email === 'string';

export const emailRules = schema<string>((email) => {
  required(email, { message: 'Enter your email address.' });
  validate(email, ({ value }) => emailFormatError(value()));
});

export const nameRules = (message: string) =>
  schema<string>((name) => {
    required(name, { message });
    validate(name, ({ value }) => tooShortError(value(), message));
  });

export const passwordRules = (requiredMessage: string) =>
  schema<string>((password) => {
    required(password, { message: requiredMessage });
    minLength(password, MINIMUM_PASSWORD_LENGTH, {
      message: `Use at least ${MINIMUM_PASSWORD_LENGTH} characters.`,
    });
  });

export const passwordPairRules = (requiredMessage: string) =>
  schema<PasswordPair>((pair) => {
    apply(pair.password, passwordRules(requiredMessage));
    required(pair.confirmPassword, { message: PASSWORD_MISMATCH_MESSAGE });
    validate(pair.confirmPassword, ({ value, valueOf }) =>
      mismatchError(value(), valueOf(pair.password)),
    );
  });

export const focusFirstInvalid = <TModel>(submitted: FieldTree<TModel>): void => {
  submitted().errorSummary()[0]?.fieldTree().focusBoundControl();
};

export const carriedEmail = (router: Router): string => {
  const state: unknown = router.currentNavigation()?.extras.state;
  return carriesEmail(state) ? state.email : '';
};
