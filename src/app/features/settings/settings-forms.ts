import { FieldTree, ValidationError } from '@angular/forms/signals';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

export const EMAIL_ERROR_MESSAGE = 'Enter a valid email address.';
export const PASSWORD_LENGTH_MESSAGE = 'New password needs at least 8 characters.';
export const PASSWORD_MISMATCH_MESSAGE = 'The new passwords don’t match.';
export const CURRENT_PASSWORD_MESSAGE = 'Enter your current password.';

export const emailError = (email: string): ValidationError | undefined =>
  EMAIL_PATTERN.test(email.trim()) ? undefined : { kind: 'email', message: EMAIL_ERROR_MESSAGE };

export const blankTextError = (text: string, message: string): ValidationError | undefined =>
  text !== '' && !text.trim() ? { kind: 'blank', message } : undefined;

export const mismatchError = (
  confirmation: string,
  password: string,
): ValidationError | undefined =>
  confirmation === password
    ? undefined
    : { kind: 'passwordMismatch', message: PASSWORD_MISMATCH_MESSAGE };

export const focusFirstInvalid = <TModel>(submitted: FieldTree<TModel>): void => {
  submitted().errorSummary()[0]?.fieldTree().focusBoundControl();
};
