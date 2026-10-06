import { Component, computed, ElementRef, input, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import {
  OWNER_SECTION,
  WORKSPACE_SETTINGS_SECTIONS,
  workspaceSettingsLinkOf,
  WorkspaceSettingsSection,
  WorkspaceSettingsSectionId,
} from '../workspace-settings-sections';

export type WorkspaceSettingsNavLayout = 'side' | 'chips' | 'list';

const ICON_SIZES: Record<WorkspaceSettingsNavLayout, number> = { side: 16, chips: 14, list: 20 };

@Component({
  selector: 'app-workspace-settings-nav',
  imports: [RouterLink, IconComponent],
  templateUrl: './workspace-settings-nav.component.html',
  styleUrl: './workspace-settings-nav.component.scss',
  host: { '[class]': '"settings-nav--" + layout()' },
})
export class WorkspaceSettingsNavComponent {
  readonly layout = input<WorkspaceSettingsNavLayout>('side');
  readonly current = input<WorkspaceSettingsSectionId | null>(null);
  readonly sections = input<readonly WorkspaceSettingsSection[]>(WORKSPACE_SETTINGS_SECTIONS);

  private readonly links = viewChildren<ElementRef<HTMLAnchorElement>>('sectionLink');

  protected readonly dangerSection = OWNER_SECTION;
  protected readonly linkOf = workspaceSettingsLinkOf;
  protected readonly iconSize = computed(() => ICON_SIZES[this.layout()]);

  focusSection(id: WorkspaceSettingsSectionId): void {
    const link = this.links().find(
      (candidate) => candidate.nativeElement.dataset['section'] === id,
    );
    link?.nativeElement.focus();
  }
}
