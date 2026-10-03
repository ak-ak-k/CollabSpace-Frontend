import { Component, computed, input } from '@angular/core';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

export type WorkspaceSettingsNoteKind = 'locked' | 'info';

@Component({
  selector: 'app-workspace-settings-note',
  imports: [IconComponent],
  templateUrl: './workspace-settings-note.component.html',
  styleUrl: './workspace-settings-note.component.scss',
  host: {
    '[class]': '"note--" + kind()',
    '[attr.role]': 'kind() === "locked" ? "note" : null',
  },
})
export class WorkspaceSettingsNoteComponent {
  readonly kind = input<WorkspaceSettingsNoteKind>('info');

  protected readonly icon = computed(() => (this.kind() === 'locked' ? 'lock' : 'info'));
}
