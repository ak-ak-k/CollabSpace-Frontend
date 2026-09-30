import { Component, ElementRef, model, viewChild } from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { IconComponent } from '../icon/icon.component';
import { FieldErrorComponent } from '../input/field-error/field-error.component';
import { FieldControl } from '../input/field/field-control';

@Component({
  selector: 'app-checkbox',
  imports: [IconComponent, FieldErrorComponent],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent extends FieldControl implements FormCheckboxControl {
  readonly checked = model(false);

  private readonly control = viewChild.required<ElementRef<HTMLInputElement>>('control');

  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }
}
