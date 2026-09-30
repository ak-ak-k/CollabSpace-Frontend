import { Component, signal } from '@angular/core';
import { CheckboxComponent } from '../../../../../shared/ui/checkbox/checkbox.component';
import { RadioGroupComponent } from '../../../../../shared/ui/radio/radio-group.component';
import { ToggleComponent } from '../../../../../shared/ui/toggle/toggle.component';
import {
  LAYOUT_OPTIONS,
  PRIORITY_OPTIONS,
  PRIVACY_OPTIONS,
  STATUS_OPTIONS,
} from '../forms-demo-options';

@Component({
  selector: 'app-styleguide-choices-demo',
  imports: [CheckboxComponent, RadioGroupComponent, ToggleComponent],
  templateUrl: './choices-demo.component.html',
  styleUrl: './choices-demo.component.scss',
})
export class ChoicesDemoComponent {
  protected readonly priorityOptions = PRIORITY_OPTIONS;
  protected readonly layoutOptions = LAYOUT_OPTIONS;
  protected readonly privacyOptions = PRIVACY_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly remember = signal(true);
  protected readonly terms = signal(false);
  protected readonly priority = signal('medium');
  protected readonly layout = signal('list');
  protected readonly privacy = signal('private');
  protected readonly status = signal('online');
  protected readonly notifications = signal(true);
  protected readonly sounds = signal(false);
  protected readonly compact = signal(false);
}
