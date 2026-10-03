import { Component, ElementRef, input, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SecondarySidebarComponent } from '../../../layout/secondary-sidebar/secondary-sidebar.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SETTINGS_GROUP_VIEWS, SettingsSectionId } from '../settings-sections';

@Component({
  selector: 'app-settings-nav',
  imports: [RouterLink, SecondarySidebarComponent, IconComponent],
  templateUrl: './settings-nav.component.html',
  styleUrl: './settings-nav.component.scss',
})
export class SettingsNavComponent {
  readonly current = input<SettingsSectionId | null>(null);

  private readonly links = viewChildren<ElementRef<HTMLAnchorElement>>('sectionLink');

  protected readonly groups = SETTINGS_GROUP_VIEWS;

  focusSection(id: SettingsSectionId): void {
    const link = this.links().find(
      (candidate) => candidate.nativeElement.dataset['section'] === id,
    );
    link?.nativeElement.focus();
  }
}
