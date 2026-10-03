import { Component, model } from '@angular/core';
import { ToggleComponent } from '../../../shared/ui/toggle/toggle.component';
import { SettingRowComponent } from '../setting-row/setting-row.component';

@Component({
  selector: 'li[appSettingSwitch]',
  imports: [ToggleComponent],
  templateUrl: './setting-switch.component.html',
  styleUrl: './setting-switch.component.scss',
})
export class SettingSwitchComponent extends SettingRowComponent {
  readonly checked = model(false);
}
