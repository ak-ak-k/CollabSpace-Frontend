import type { ValidationError } from '@angular/forms/signals';

export type FieldErrors = readonly ValidationError.WithOptionalFieldTree[];

export interface FieldErrorState {
  readonly errorMessage: string;
  readonly invalid: boolean;
  readonly touched: boolean;
  readonly errors: FieldErrors;
}

export interface FieldErrorView {
  readonly invalid: boolean;
  readonly message: string;
}

const NO_ERROR: FieldErrorView = { invalid: false, message: '' };

export function resolveFieldError(state: FieldErrorState): FieldErrorView {
  if (state.errorMessage) {
    return { invalid: true, message: state.errorMessage };
  }
  if (!state.invalid || !state.touched) {
    return NO_ERROR;
  }
  return { invalid: true, message: state.errors[0]?.message ?? '' };
}
