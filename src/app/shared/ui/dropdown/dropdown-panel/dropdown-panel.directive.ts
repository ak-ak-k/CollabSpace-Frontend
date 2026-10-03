import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appDropdownPanel]',
  host: {
    role: 'dialog',
    '[attr.aria-label]': 'appDropdownPanel()',
  },
})
export class DropdownPanelDirective {
  readonly appDropdownPanel = input.required<string>();
}
