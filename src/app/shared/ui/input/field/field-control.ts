import {
  booleanAttribute,
  computed,
  Directive,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { FieldErrors, resolveFieldError } from './field-error';
import { createUniqueId } from './unique-id';

export type FieldSize = 'md' | 'lg';

export function optionalNumberAttribute(value: unknown): number | undefined {
  return value === undefined || value === null || value === '' ? undefined : numberAttribute(value);
}

@Directive()
export abstract class FieldControl {
  readonly errorMessage = input('');
  readonly errors = input<FieldErrors>([]);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly name = input('');
  readonly touch = output<void>();

  protected readonly controlId = createUniqueId('field');
  protected readonly labelId = `${this.controlId}-label`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly error = computed(() =>
    resolveFieldError({
      errorMessage: this.errorMessage(),
      invalid: this.invalid(),
      touched: this.touched(),
      errors: this.errors(),
    }),
  );
  protected readonly renderedErrorId = computed(() => (this.error().message ? this.errorId : null));
}
