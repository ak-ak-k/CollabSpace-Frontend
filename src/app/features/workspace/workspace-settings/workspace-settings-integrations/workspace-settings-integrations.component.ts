import { Component, inject } from '@angular/core';
import { Integration } from '../../../../core/models/preferences';
import { ToastService } from '../../../../core/services/toast.service';
import { PreferencesState } from '../../../../core/state/preferences.state';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { TagComponent } from '../../../../shared/ui/tag/tag.component';
import { WorkspacePreferenceUpdates } from '../workspace-preference-updates.service';

@Component({
  selector: 'app-workspace-settings-integrations',
  imports: [
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
    TagComponent,
  ],
  templateUrl: './workspace-settings-integrations.component.html',
  styleUrl: './workspace-settings-integrations.component.scss',
})
export class WorkspaceSettingsIntegrationsComponent {
  private readonly state = inject(PreferencesState);
  private readonly updates = inject(WorkspacePreferenceUpdates);
  private readonly toasts = inject(ToastService);

  protected readonly status = this.state.status;
  protected readonly integrations = this.state.integrations;

  protected toggle(integration: Integration): void {
    const connected = !integration.connected;
    void this.state.setIntegration(integration.id, connected);
    if (connected) {
      this.updates.record({
        kind: 'integration',
        verb: 'connected',
        object: integration.name,
        section: 'integrations',
      });
    }
    this.toasts.show(`${integration.name} ${connected ? 'connected' : 'disconnected'}`, {
      icon: 'plug',
    });
  }

  protected reload(): void {
    void this.state.reload();
  }
}
