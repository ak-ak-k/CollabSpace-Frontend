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
import type { FormCheckboxControl } from '@angular/forms/signals';
import { createUniqueId } from '../input/field/unique-id';

export type ToggleLabelPosition = 'start' | 'end';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
  host: {
    '[class.toggle--inline]': 'inline()',
  },
})
export class ToggleComponent implements FormCheckboxControl {
  readonly checked = model(false);
  readonly label = input.required<string>();
  readonly description = input('');
  readonly labelPosition = input<ToggleLabelPosition>('start');
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input('');
  readonly touch = output<void>();

  private readonly control = viewChild.required<ElementRef<HTMLButtonElement>>('control');

  protected readonly labelId = createUniqueId('toggle');
  protected readonly descriptionId = `${this.labelId}-description`;
  protected readonly inline = computed(() => this.hideLabel() || this.labelPosition() === 'end');

  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }

  protected toggle(): void {
    this.checked.update((checked) => !checked);
  }
}
