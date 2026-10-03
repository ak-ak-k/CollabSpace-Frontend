import { Component, computed, ElementRef, input, model, viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { cleanSlugInput } from '../../../../core/models/workspace-rules';
import { FieldErrorComponent } from '../../../../shared/ui/input/field-error/field-error.component';
import {
  FieldControl,
  optionalNumberAttribute,
} from '../../../../shared/ui/input/field/field-control';
import { joinIds } from '../../../../shared/ui/input/field/unique-id';

@Component({
  selector: 'app-workspace-url-field',
  imports: [FieldErrorComponent],
  templateUrl: './workspace-url-field.component.html',
  styleUrl: './workspace-url-field.component.scss',
})
export class WorkspaceUrlFieldComponent extends FieldControl implements FormValueControl<string> {
  readonly value = model('');
  readonly label = input.required<string>();
  readonly suffix = input.required<string>();
  readonly placeholder = input('');
  readonly hint = input('');
  readonly maxlength = input(undefined, { transform: optionalNumberAttribute });

  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  protected readonly suffixId = `${this.controlId}-suffix`;
  protected readonly describedBy = computed(() =>
    joinIds(this.suffixId, this.hint() ? this.hintId : null, this.renderedErrorId()),
  );

  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }

  protected clean(control: HTMLInputElement): void {
    const slug = cleanSlugInput(control.value);
    if (control.value !== slug) {
      control.value = slug;
    }
    this.value.set(slug);
  }
}
