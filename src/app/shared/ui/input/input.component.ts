import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { IconComponent } from '../icon/icon.component';
import { FieldErrorComponent } from './field-error/field-error.component';
import { FieldControl, FieldSize, optionalNumberAttribute } from './field/field-control';
import { joinIds } from './field/unique-id';

export type InputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'date' | 'number';
export type InputMode =
  'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

@Component({
  selector: 'app-input',
  imports: [IconComponent, FieldErrorComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent extends FieldControl implements FormValueControl<string> {
  readonly value = model('');
  readonly label = input.required<string>();
  readonly type = input<InputType>('text');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly autocomplete = input('');
  readonly inputmode = input<InputMode | ''>('');
  readonly maxlength = input(undefined, { transform: optionalNumberAttribute });
  readonly size = input<FieldSize>('md');
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly optional = input(false, { transform: booleanAttribute });
  readonly revealable = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });

  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  protected readonly revealed = signal(false);
  protected readonly canReveal = computed(() => this.revealable() && this.type() === 'password');
  protected readonly nativeType = computed(() =>
    this.canReveal() && this.revealed() ? 'text' : this.type(),
  );
  protected readonly describedBy = computed(() =>
    joinIds(this.hint() ? this.hintId : null, this.renderedErrorId()),
  );

  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }

  protected toggleReveal(): void {
    this.revealed.update((revealed) => !revealed);
  }
}
