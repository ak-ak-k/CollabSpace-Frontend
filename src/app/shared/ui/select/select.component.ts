import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { IconComponent } from '../icon/icon.component';
import { FieldErrorComponent } from '../input/field-error/field-error.component';
import { FieldControl, FieldSize } from '../input/field/field-control';
import { joinIds } from '../input/field/unique-id';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-select',
  imports: [IconComponent, FieldErrorComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  host: { '[class.select--inline]': 'inlineLabel()' },
})
export class SelectComponent extends FieldControl implements FormValueControl<string> {
  readonly value = model('');
  readonly label = input.required<string>();
  readonly options = input.required<readonly SelectOption[]>();
  readonly placeholder = input('');
  readonly hint = input('');
  readonly size = input<FieldSize>('md');
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly inlineLabel = input(false, { transform: booleanAttribute });

  private readonly control = viewChild.required<ElementRef<HTMLSelectElement>>('control');

  protected readonly describedBy = computed(() =>
    joinIds(this.hint() ? this.hintId : null, this.renderedErrorId()),
  );

  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }
}
