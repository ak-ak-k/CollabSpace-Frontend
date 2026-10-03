import { Component, ElementRef, input, viewChild } from '@angular/core';

export type SettingsSectionTone = 'default' | 'danger';

@Component({
  selector: 'app-settings-section-header',
  templateUrl: './settings-section-header.component.html',
  styleUrl: './settings-section-header.component.scss',
  host: { '[class.section-header--danger]': "tone() === 'danger'" },
})
export class SettingsSectionHeaderComponent {
  readonly group = input.required<string>();
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
  readonly tone = input<SettingsSectionTone>('default');

  private readonly title = viewChild.required<ElementRef<HTMLHeadingElement>>('title');

  focusTitle(): void {
    this.title().nativeElement.focus();
  }
}
