import { Component, computed, ElementRef, input, model, viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { cleanSlugInput, WORKSPACE_SLUG_MAX_LENGTH } from '../../../core/models/workspace-rules';
import { FieldErrorComponent } from '../../../shared/ui/input/field-error/field-error.component';
import { FieldControl } from '../../../shared/ui/input/field/field-control';
import { joinIds } from '../../../shared/ui/input/field/unique-id';

@Component({
  selector: 'app-settings-url-field',
  imports: [FieldErrorComponent],
  templateUrl: './settings-url-field.component.html',
  styleUrl: './settings-url-field.component.scss',
})
export class SettingsUrlFieldComponent extends FieldControl implements FormValueControl<string> {
  readonly value = model('');
  readonly label = input.required<string>();
  readonly suffix = input.required<string>();
  readonly hint = input('');

  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  protected readonly slugMaxLength = WORKSPACE_SLUG_MAX_LENGTH;
  protected readonly suffixId = `${this.controlId}-suffix`;
  protected readonly describedBy = computed(() =>
    joinIds(this.suffixId, this.hint() ? this.hintId : null, this.renderedErrorId()),
  );

  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }

  protected sanitize(control: HTMLInputElement): void {
    const slug = cleanSlugInput(control.value);
    control.value = slug;
    this.value.set(slug);
  }
}
