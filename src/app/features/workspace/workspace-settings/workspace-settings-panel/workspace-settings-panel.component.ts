import { Component, computed, inject, input } from '@angular/core';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { WorkspaceSettingsAppearanceComponent } from '../workspace-settings-appearance/workspace-settings-appearance.component';
import { WorkspaceSettingsDangerComponent } from '../workspace-settings-danger/workspace-settings-danger.component';
import { WorkspaceSettingsGeneralComponent } from '../workspace-settings-general/workspace-settings-general.component';
import { WorkspaceSettingsIntegrationsComponent } from '../workspace-settings-integrations/workspace-settings-integrations.component';
import { WorkspaceSettingsMembersComponent } from '../workspace-settings-members/workspace-settings-members.component';
import { WorkspaceSettingsNoteComponent } from '../workspace-settings-note/workspace-settings-note.component';
import { WorkspaceSettingsNotificationsComponent } from '../workspace-settings-notifications/workspace-settings-notifications.component';
import { WorkspaceSettingsRolesComponent } from '../workspace-settings-roles/workspace-settings-roles.component';
import { WorkspaceSettingsSecurityComponent } from '../workspace-settings-security/workspace-settings-security.component';
import { OWNER_SECTION, WorkspaceSettingsSection } from '../workspace-settings-sections';
import { readOnlyNoteOf } from '../workspace-settings-view';

@Component({
  selector: 'app-workspace-settings-panel',
  imports: [
    WorkspaceSettingsAppearanceComponent,
    WorkspaceSettingsDangerComponent,
    WorkspaceSettingsGeneralComponent,
    WorkspaceSettingsIntegrationsComponent,
    WorkspaceSettingsMembersComponent,
    WorkspaceSettingsNoteComponent,
    WorkspaceSettingsNotificationsComponent,
    WorkspaceSettingsRolesComponent,
    WorkspaceSettingsSecurityComponent,
  ],
  templateUrl: './workspace-settings-panel.component.html',
  styleUrl: './workspace-settings-panel.component.scss',
})
export class WorkspaceSettingsPanelComponent {
  private readonly workspace = inject(WorkspaceState);

  readonly section = input.required<WorkspaceSettingsSection>();

  protected readonly ownerSection = OWNER_SECTION;
  protected readonly readOnlyNote = computed(() => {
    const access = this.workspace.access();
    const name = this.workspace.currentWorkspace()?.name ?? 'this workspace';
    return access.canManage ? '' : readOnlyNoteOf(access.myRole, name);
  });
}
