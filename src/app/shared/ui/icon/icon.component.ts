import { booleanAttribute, Component, computed, input, numberAttribute } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { ICON_REGISTRY, IconName } from './icon-registry';

const DEFAULT_ICON_SIZE = 18;

@Component({
  selector: 'app-icon',
  imports: [LucideDynamicIcon],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  host: {
    'aria-hidden': 'true',
    '[class.icon--filled]': 'filled()',
  },
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(DEFAULT_ICON_SIZE, { transform: numberAttribute });
  readonly filled = input(false, { transform: booleanAttribute });

  protected readonly icon = computed(() => ICON_REGISTRY[this.name()]);
}
