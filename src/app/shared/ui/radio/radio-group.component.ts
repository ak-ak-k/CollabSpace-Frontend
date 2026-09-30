import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  input,
  model,
  viewChildren,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icon-registry';
import { FieldErrorComponent } from '../input/field-error/field-error.component';
import { FieldControl } from '../input/field/field-control';
import { joinIds } from '../input/field/unique-id';

export type RadioAppearance = 'segmented' | 'list' | 'tiles';

export interface RadioOption {
  readonly value: string;
  readonly label: string;
  readonly icon?: IconName;
  readonly description?: string;
  readonly swatch?: string;
}

@Component({
  selector: 'app-radio-group',
  imports: [IconComponent, FieldErrorComponent],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  host: {
    '[class]': '"radio-group--" + appearance()',
    '[class.radio-group--stretch]': 'stretch()',
  },
})
export class RadioGroupComponent extends FieldControl implements FormValueControl<string> {
  readonly value = model('');
  readonly label = input.required<string>();
  readonly options = input.required<readonly RadioOption[]>();
  readonly appearance = input<RadioAppearance>('segmented');
  readonly hint = input('');
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly stretch = input(false, { transform: booleanAttribute });
  readonly iconOnly = input(false, { transform: booleanAttribute });

  private readonly radios = viewChildren<ElementRef<HTMLInputElement>>('radio');

  protected readonly groupName = computed(() => this.name() || this.controlId);
  protected readonly describesOptions = computed(() => this.appearance() !== 'segmented');
  protected readonly describedBy = computed(() =>
    joinIds(this.hint() ? this.hintId : null, this.renderedErrorId()),
  );

  focus(options?: FocusOptions): void {
    const radios = this.radios().map((radio) => radio.nativeElement);
    const target = radios.find((radio) => radio.checked) ?? radios[0];
    target?.focus(options);
  }

  protected optionLabelId(index: number): string {
    return `${this.controlId}-option-${index}`;
  }

  protected optionDescriptionId(option: RadioOption, index: number): string | null {
    return option.description && this.describesOptions()
      ? `${this.optionLabelId(index)}-description`
      : null;
  }
}
