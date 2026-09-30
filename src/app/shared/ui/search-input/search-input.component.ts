import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { IconComponent } from '../icon/icon.component';
import { FieldSize } from '../input/field/field-control';

@Component({
  selector: 'app-search-input',
  imports: [IconComponent],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
})
export class SearchInputComponent implements FormValueControl<string> {
  readonly value = model('');
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly size = input<FieldSize>('md');
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input('');
  readonly touch = output<void>();
  readonly cleared = output<void>();

  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  protected readonly clearVisible = computed(
    () => this.clearable() && !this.disabled() && this.value().length > 0,
  );

  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }

  protected clear(): void {
    this.value.set('');
    this.cleared.emit();
    this.focus();
  }
}
