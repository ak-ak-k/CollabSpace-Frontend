import { inject, Service } from '@angular/core';
import { WorkspacePreferences } from '../../../core/models/workspace';
import { ActivityChange, ActivityKind } from '../../../core/models/activity';
import { ToastService } from '../../../core/services/toast.service';
import { WorkspaceActivityState } from '../../../core/state/workspace-activity.state';
import { WorkspaceAdminState } from '../../../core/state/workspace-admin.state';
import { workspaceSettingsLinkOf, WorkspaceSettingsSectionId } from './workspace-settings-sections';

export interface SettingsActivity {
  readonly kind: ActivityKind;
  readonly verb: string;
  readonly object: string;
  readonly section: WorkspaceSettingsSectionId;
  readonly change?: ActivityChange;
}

@Service()
export class WorkspacePreferenceUpdates {
  private readonly admin = inject(WorkspaceAdminState);
  private readonly activity = inject(WorkspaceActivityState);
  private readonly toasts = inject(ToastService);

  set(changes: Partial<WorkspacePreferences>, message: string): void {
    void this.admin.updatePreferences(changes);
    this.toasts.show(message, { icon: 'circle-check' });
  }

  warn(message: string): void {
    this.toasts.show(message, { icon: 'circle-alert' });
  }

  record({ kind, verb, object, section, change }: SettingsActivity): string {
    return this.activity.record({
      kind,
      verb,
      object,
      route: workspaceSettingsLinkOf(section),
      change,
    });
  }
}
