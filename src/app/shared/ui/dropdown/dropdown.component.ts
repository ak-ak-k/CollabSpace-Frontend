import { CdkMenu } from '@angular/cdk/menu';
import { Component, input } from '@angular/core';

export type DropdownWidth = 'sm' | 'md';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  hostDirectives: [CdkMenu],
  host: {
    '[attr.aria-label]': 'label()',
    '[class.dropdown--md]': 'width() === "md"',
    '(keydown.escape)': '$event.stopPropagation()',
  },
})
export class DropdownComponent {
  readonly label = input.required<string>();
  readonly width = input<DropdownWidth>('sm');
}
