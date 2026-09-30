import { booleanAttribute, Component, input } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'button[appButton], a[appButton]',
  imports: [SpinnerComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  host: {
    '[class]': 'variantClass() + " " + sizeClass()',
    '[class.button--block]': 'block()',
    '[class.button--busy]': 'busy()',
    '[attr.aria-busy]': 'busy() ? "true" : null',
  },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });

  protected variantClass(): string {
    return `button--${this.variant()}`;
  }

  protected sizeClass(): string {
    return `button--${this.size()}`;
  }
}
