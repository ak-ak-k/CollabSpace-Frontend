import { Component, input } from '@angular/core';

export type IconButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'button[appIconButton], a[appIconButton]',
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  host: {
    '[class]': '"icon-button--" + size()',
    '[class.icon-button--pressed]': 'pressed() === true',
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'label()',
    '[attr.aria-pressed]': 'pressed() ?? null',
  },
})
export class IconButtonComponent {
  readonly label = input.required<string>();
  readonly size = input<IconButtonSize>('sm');
  readonly pressed = input<boolean | undefined>(undefined);
}
