import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  numberAttribute,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { FieldErrorComponent } from '../input/field-error/field-error.component';
import { FieldControl, optionalNumberAttribute } from '../input/field/field-control';
import { joinIds } from '../input/field/unique-id';

const DEFAULT_ROWS = 3;

@Component({
  selector: 'app-textarea',
  imports: [FieldErrorComponent],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
})
export class TextareaComponent extends FieldControl implements FormValueControl<string> {
  readonly value = model('');
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly hint = input('');
  readonly autocomplete = input('');
  readonly rows = input(DEFAULT_ROWS, { transform: numberAttribute });
  readonly maxlength = input(undefined, { transform: optionalNumberAttribute });
  readonly showCount = input(false, { transform: booleanAttribute });
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly optional = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });

  private readonly control = viewChild.required<ElementRef<HTMLTextAreaElement>>('control');

  protected readonly countId = `${this.controlId}-count`;
  protected readonly countVisible = computed(
    () => this.showCount() && this.maxlength() !== undefined,
  );
  protected readonly describedBy = computed(() =>
    joinIds(
      this.hint() ? this.hintId : null,
      this.renderedErrorId(),
      this.countVisible() ? this.countId : null,
    ),
  );

  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }
}
