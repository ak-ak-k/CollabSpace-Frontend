import { Component, inject, linkedSignal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { InvitePolicy, WorkspacePreferences } from '../../../../core/models/workspace';
import { WORKSPACE_ROLE_LABELS } from '../../../../core/models/workspace-role';
import { ConnectionGuard } from '../../../../core/services/connection-guard.service';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import {
  RadioGroupComponent,
  RadioOption,
} from '../../../../shared/ui/radio/radio-group.component';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import { SettingRowComponent } from '../../../settings/setting-row/setting-row.component';
import { SettingSwitchComponent } from '../../../settings/setting-switch/setting-switch.component';
import { preferenceControl } from '../preference-control';
import { WorkspacePendingInvitesComponent } from '../workspace-pending-invites/workspace-pending-invites.component';
import { WorkspacePreferenceUpdates } from '../workspace-preference-updates.service';
import { parseDomains } from '../workspace-settings-view';

type InviteRole = WorkspacePreferences['defaultRole'];

const INVITE_POLICY_OPTIONS: readonly RadioOption[] = [
  { value: 'admins', label: 'Owners and admins' },
  { value: 'everyone', label: 'Everyone except guests' },
];

const INVITE_ROLES: readonly InviteRole[] = ['member', 'guest'];

const ROLE_OPTIONS: readonly SelectOption[] = INVITE_ROLES.map((role) => ({
  value: role,
  label: WORKSPACE_ROLE_LABELS[role],
}));

const invitePolicyOf = (value: string): InvitePolicy =>
  value === 'everyone' ? 'everyone' : 'admins';
const inviteRoleOf = (value: string): InviteRole => (value === 'guest' ? 'guest' : 'member');

@Component({
  selector: 'app-workspace-settings-members',
  imports: [
    FormField,
    ButtonComponent,
    InputComponent,
    RadioGroupComponent,
    SelectComponent,
    SettingRowComponent,
    SettingSwitchComponent,
    WorkspacePendingInvitesComponent,
  ],
  templateUrl: './workspace-settings-members.component.html',
  styleUrl: './workspace-settings-members.component.scss',
})
export class WorkspaceSettingsMembersComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly updates = inject(WorkspacePreferenceUpdates);
  private readonly connection = inject(ConnectionGuard);

  private readonly domainsDraft = linkedSignal(() => this.workspace.preferences()?.domains ?? '');

  protected readonly preferences = this.workspace.preferences;
  protected readonly policyOptions = INVITE_POLICY_OPTIONS;
  protected readonly roleOptions = ROLE_OPTIONS;
  protected readonly domainsForm = form(this.domainsDraft);
  protected readonly invitePolicy = preferenceControl<string>(
    () => this.preferences()?.whoCanInvite ?? 'admins',
  );
  protected readonly defaultRole = preferenceControl<string>(
    () => this.preferences()?.defaultRole ?? 'member',
  );
  protected readonly restricted = preferenceControl(
    () => this.preferences()?.restrictDomains ?? false,
  );

  protected setInvitePolicy(value: string): void {
    const whoCanInvite = invitePolicyOf(value);
    const label =
      INVITE_POLICY_OPTIONS.find((option) => option.value === whoCanInvite)?.label ?? '';
    this.updates.set(
      { whoCanInvite },
      `Invitations: ${label.toLowerCase()}`,
      this.invitePolicy.reset,
    );
  }

  protected setDefaultRole(value: string): void {
    const defaultRole = inviteRoleOf(value);
    this.updates.set(
      { defaultRole },
      `Default role set to ${WORKSPACE_ROLE_LABELS[defaultRole]}`,
      this.defaultRole.reset,
    );
  }

  protected setRestricted(restrictDomains: boolean): void {
    const domain = this.workspace.currentWorkspace()?.domain ?? '';
    const hasDomains = (this.preferences()?.domains ?? '').trim() !== '';
    const prefill = restrictDomains && !hasDomains && domain ? { domains: domain } : {};
    this.updates.set(
      { restrictDomains, ...prefill },
      restrictDomains
        ? 'Invitations limited to approved domains'
        : 'Any email domain can be invited',
      this.restricted.reset,
    );
  }

  protected saveDomains(event: Event): void {
    event.preventDefault();
    const domains = parseDomains(this.domainsDraft());
    if (domains.length === 0) {
      this.updates.warn('Add at least one domain, or turn the restriction off');
      return;
    }
    if (!this.connection.allowsSave()) {
      return;
    }
    this.updates.set({ domains: domains.join(', ') }, 'Approved domains saved');
  }
}
