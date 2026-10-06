import {
  afterNextRender,
  Component,
  computed,
  inject,
  Injector,
  linkedSignal,
  WritableSignal,
} from '@angular/core';
import { SessionLength, WorkspacePreferences } from '../../../../core/models/workspace';
import { DialogService } from '../../../../core/services/dialog.service';
import { ToastService } from '../../../../core/services/toast.service';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import { SettingRowComponent } from '../../../settings/setting-row/setting-row.component';
import { SettingSwitchComponent } from '../../../settings/setting-switch/setting-switch.component';
import { WorkspacePreferenceUpdates } from '../workspace-preference-updates.service';

interface SignInUpdate {
  readonly changes: Partial<WorkspacePreferences>;
  readonly label: string;
}

const SESSION_LENGTHS: readonly SessionLength[] = ['24 hours', '7 days', '30 days', '90 days'];
const SESSION_OPTIONS: readonly SelectOption[] = SESSION_LENGTHS.map((length) => ({
  value: length,
  label: length,
}));

@Component({
  selector: 'app-workspace-settings-security',
  imports: [
    ButtonComponent,
    IconComponent,
    SelectComponent,
    SettingRowComponent,
    SettingSwitchComponent,
  ],
  templateUrl: './workspace-settings-security.component.html',
  styleUrl: './workspace-settings-security.component.scss',
})
export class WorkspaceSettingsSecurityComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly updates = inject(WorkspacePreferenceUpdates);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly injector = inject(Injector);

  private readonly memberCount = computed(() => this.workspace.members().length);

  protected readonly preferences = this.workspace.preferences;
  protected readonly sessionOptions = SESSION_OPTIONS;
  protected readonly requireTwoFactor = linkedSignal(
    () => this.preferences()?.requireTwoFactor ?? false,
  );
  protected readonly passwordSignIn = linkedSignal(
    () => this.preferences()?.passwordSignIn ?? true,
  );
  protected readonly googleSignIn = linkedSignal(() => this.preferences()?.googleSignIn ?? true);

  protected async setTwoFactor(required: boolean): Promise<void> {
    if (!required) {
      this.applyTwoFactor(false);
      return;
    }
    const confirmed = await this.dialogs.confirm({
      tone: 'neutral',
      icon: 'shield-check',
      title: 'Require two-step verification?',
      body: `All ${this.memberCount()} members will need an authenticator app. Anyone without one is asked to set it up the next time they sign in.`,
      confirmLabel: 'Require it',
    });
    if (confirmed) {
      this.applyTwoFactor(true);
    } else {
      this.requireTwoFactor.set(false);
    }
  }

  protected setPasswordSignIn(on: boolean): void {
    this.setSignIn(on, this.passwordSignIn, this.googleSignIn(), {
      changes: { passwordSignIn: on },
      label: 'Email and password sign-in',
    });
  }

  protected setGoogleSignIn(on: boolean): void {
    this.setSignIn(on, this.googleSignIn, this.passwordSignIn(), {
      changes: { googleSignIn: on },
      label: 'Google sign-in',
    });
  }

  protected setSessionLength(value: string): void {
    const sessionLength = SESSION_LENGTHS.find((length) => length === value);
    if (!sessionLength) {
      return;
    }
    this.updates.set({ sessionLength }, `Sessions now last ${sessionLength}`);
  }

  protected async signEveryoneOut(): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      icon: 'log-out',
      title: 'Sign everyone out?',
      body: `All ${this.memberCount()} members will need to sign in again on every device. You’ll stay signed in here.`,
      confirmLabel: 'Sign everyone out',
    });
    if (confirmed) {
      this.toasts.show('Everyone else has been signed out', { icon: 'log-out' });
      this.updates.record({
        kind: 'security',
        verb: 'signed out',
        object: 'everyone',
        section: 'security',
      });
    }
  }

  private applyTwoFactor(required: boolean): void {
    this.updates.set(
      { requireTwoFactor: required },
      required
        ? 'Two-step verification required for everyone'
        : 'Two-step verification is now optional',
    );
  }

  private setSignIn(
    on: boolean,
    method: WritableSignal<boolean>,
    otherMethodOn: boolean,
    update: SignInUpdate,
  ): void {
    if (!on && !otherMethodOn) {
      afterNextRender(() => method.set(true), { injector: this.injector });
      this.updates.warn('Keep at least one sign-in method turned on');
      return;
    }
    this.updates.set(update.changes, `${update.label} ${on ? 'on' : 'off'}`);
  }
}
