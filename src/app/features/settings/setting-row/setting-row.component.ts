import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'li[appSettingRow]',
  templateUrl: './setting-row.component.html',
  styleUrl: './setting-row.component.scss',
  host: { '[class.setting-row--wrap]': 'wrap()' },
})
export class SettingRowComponent {
  readonly label = input.required<string>();
  readonly description = input('');
  readonly wrap = input(false, { transform: booleanAttribute });
}
