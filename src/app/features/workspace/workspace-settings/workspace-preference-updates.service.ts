import { afterNextRender, inject, Injector, Service } from '@angular/core';
import { WorkspacePreferences } from '../../../core/models/workspace';
import { ActivityChange, ActivityKind } from '../../../core/models/activity';
import { ActivityAction } from '../../../core/models/activity-action';
import { ConnectionGuard } from '../../../core/services/connection-guard.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkspaceActivityState } from '../../../core/state/workspace-activity.state';
import { WorkspaceAdminState } from '../../../core/state/workspace-admin.state';
import { workspaceSettingsLinkOf, WorkspaceSettingsSectionId } from './workspace-settings-sections';

export interface SettingsActivity {
  readonly kind: ActivityKind;
  readonly verb: string;
  readonly object: string;
  readonly section: WorkspaceSettingsSectionId;
  readonly action: ActivityAction;
  readonly change?: ActivityChange;
}

@Service()
export class WorkspacePreferenceUpdates {
  private readonly admin = inject(WorkspaceAdminState);
  private readonly activity = inject(WorkspaceActivityState);
  private readonly toasts = inject(ToastService);
  private readonly connection = inject(ConnectionGuard);
  private readonly injector = inject(Injector);

  set(changes: Partial<WorkspacePreferences>, message: string, revert?: () => void): boolean {
    if (!this.connection.allows('setWsPref')) {
      if (revert) {
        afterNextRender(revert, { injector: this.injector });
      }
      return false;
    }
    void this.admin.updatePreferences(changes);
    this.toasts.show(message, { icon: 'circle-check' });
    return true;
  }

  warn(message: string): void {
    this.toasts.show(message, { icon: 'circle-alert' });
  }

  record({ kind, verb, object, section, action, change }: SettingsActivity): string {
    return this.activity.record({
      kind,
      verb,
      object,
      route: workspaceSettingsLinkOf(section),
      action,
      change,
    });
  }
}
