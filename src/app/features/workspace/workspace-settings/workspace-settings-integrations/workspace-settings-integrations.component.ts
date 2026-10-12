import { Component, inject } from '@angular/core';
import { ActivityChange } from '../../../../core/models/activity';
import { Integration } from '../../../../core/models/preferences';
import { ConnectionGuard } from '../../../../core/services/connection-guard.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PreferencesState } from '../../../../core/state/preferences.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { TagComponent } from '../../../../shared/ui/tag/tag.component';
import { WorkspacePreferenceUpdates } from '../workspace-preference-updates.service';

const CONNECTED = 'Connected';
const NOT_CONNECTED = 'Not connected';

const connectionChangeOf = (connected: boolean): ActivityChange =>
  connected ? { from: NOT_CONNECTED, to: CONNECTED } : { from: CONNECTED, to: NOT_CONNECTED };

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
  private readonly workspace = inject(WorkspaceState);
  private readonly connection = inject(ConnectionGuard);

  protected readonly status = this.state.status;
  protected readonly integrations = this.state.integrations;

  protected toggle(integration: Integration): void {
    if (
      !this.workspace.can('integrations.manage') ||
      !this.connection.allows('toggleIntegration')
    ) {
      return;
    }
    const connected = !integration.connected;
    void this.state.setIntegration(integration.id, connected);
    this.updates.record({
      kind: 'integration',
      verb: connected ? 'connected' : 'disconnected',
      object: integration.name,
      section: 'integrations',
      action: connected ? 'integration.connected' : 'integration.disconnected',
      change: connectionChangeOf(connected),
    });
    this.toasts.show(`${integration.name} ${connected ? 'connected' : 'disconnected'}`, {
      icon: 'plug',
    });
  }

  protected reload(): void {
    void this.state.reload();
  }
}
