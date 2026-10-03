import { Component, computed, ElementRef, input, model, viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { FieldErrorComponent } from '../../../../shared/ui/input/field-error/field-error.component';
import {
  FieldControl,
  optionalNumberAttribute,
} from '../../../../shared/ui/input/field/field-control';
import { joinIds } from '../../../../shared/ui/input/field/unique-id';
import { cleanChannelName } from '../channel-rules';

@Component({
  selector: 'app-channel-name-field',
  imports: [FieldErrorComponent],
  templateUrl: './channel-name-field.component.html',
  styleUrl: './channel-name-field.component.scss',
})
export class ChannelNameFieldComponent extends FieldControl implements FormValueControl<string> {
  readonly value = model('');
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly hint = input('');
  readonly maxlength = input(undefined, { transform: optionalNumberAttribute });

  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  protected readonly describedBy = computed(() =>
    joinIds(this.hint() ? this.hintId : null, this.renderedErrorId()),
  );

  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }

  protected onInput(field: HTMLInputElement): void {
    const cleaned = cleanChannelName(field.value);
    if (field.value !== cleaned) {
      field.value = cleaned;
    }
    this.value.set(cleaned);
  }
}
