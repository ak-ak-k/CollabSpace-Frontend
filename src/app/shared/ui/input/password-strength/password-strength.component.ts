import { Component, computed, input } from '@angular/core';
import { evaluatePasswordStrength, PASSWORD_STRENGTH_MAX_SCORE } from './password-strength';

const BAR_POSITIONS = Array.from({ length: PASSWORD_STRENGTH_MAX_SCORE }, (_, index) => index);

@Component({
  selector: 'app-password-strength',
  templateUrl: './password-strength.component.html',
  styleUrl: './password-strength.component.scss',
  host: {
    '[class]': '"password-strength--" + strength().tone',
    '[class.password-strength--visible]': 'visible()',
  },
})
export class PasswordStrengthComponent {
  readonly password = input.required<string>();

  protected readonly barPositions = BAR_POSITIONS;
  protected readonly visible = computed(() => this.password().length > 0);
  protected readonly strength = computed(() => evaluatePasswordStrength(this.password()));
}
