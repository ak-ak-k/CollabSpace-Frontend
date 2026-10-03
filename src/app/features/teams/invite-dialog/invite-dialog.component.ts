import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { WorkspaceRole } from '../../../core/models/user';
import {
  WORKSPACE_ROLE_DETAILS,
  WORKSPACE_ROLE_LABELS,
  WORKSPACE_ROLES,
} from '../../../core/models/workspace-role';
import { InviteState } from '../../../core/state/invite.state';
import { NetworkState } from '../../../core/state/network.state';
import { WorkspaceActivityState } from '../../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import {
  allowedDomainsOf,
  checkEmailRows,
  domainPolicyOf,
  inviteBannerOf,
  inviteCountLabel,
  rowMessageOf,
  RowsSummary,
  submitLabelOf,
  summarizeRows,
} from './email-checks';
import { EmailRow, freshRows } from './email-rows';
import {
  EmailRowView,
  InviteEmailRowsComponent,
} from './invite-email-rows/invite-email-rows.component';
import { InviteResult, InviteResultComponent } from './invite-result/invite-result.component';

export interface InviteDialogData {
  readonly teamId?: string;
}

const SEND_DELAY_MS = 650;
const PENDING_INVITES_ROUTE = '/workspace/settings/members';
const FORM_SUBTITLE = 'They’ll get an email invitation to join. Invitations expire after 7 days.';
const MANAGER_ROLES: readonly WorkspaceRole[] = ['admin', 'member', 'guest'];
const MEMBER_ROLES: readonly WorkspaceRole[] = ['member', 'guest'];
const FALLBACK_ROLE: WorkspaceRole = 'member';

const roleOf = (value: string): WorkspaceRole =>
  WORKSPACE_ROLES.find((role) => role === value) ?? FALLBACK_ROLE;

const invitedObject = (emails: readonly string[]): string =>
  emails.length === 1 ? emails[0] : `${emails.length} people`;

@Component({
  selector: 'app-invite-dialog',
  imports: [
    ModalComponent,
    ButtonComponent,
    IconComponent,
    SelectComponent,
    InviteEmailRowsComponent,
    InviteResultComponent,
  ],
  templateUrl: './invite-dialog.component.html',
  styleUrl: './invite-dialog.component.scss',
})
export class InviteDialogComponent {
  private readonly dialogRef = inject<DialogRef<void>>(DialogRef);
  private readonly data = inject<InviteDialogData | null>(DIALOG_DATA, { optional: true });
  private readonly workspace = inject(WorkspaceState);
  private readonly invites = inject(InviteState);
  private readonly activity = inject(WorkspaceActivityState);
  private readonly network = inject(NetworkState);
  private readonly injector = inject(Injector);
  private readonly emailRows = viewChild(InviteEmailRowsComponent);
  private readonly doneButton = viewChild('doneButton', { read: ElementRef<HTMLButtonElement> });
  private sendTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly rows = signal<readonly EmailRow[]>(freshRows());
  protected readonly tried = signal(false);
  protected readonly busy = signal(false);
  protected readonly result = signal<InviteResult | null>(null);

  private readonly workspaceName = computed(
    () => this.workspace.currentWorkspace()?.name ?? 'your workspace',
  );
  protected readonly heading = computed(() => `Invite people to ${this.workspaceName()}`);
  protected readonly subtitle = computed(() => {
    const result = this.result();
    if (!result) {
      return FORM_SUBTITLE;
    }
    return result.teamName
      ? `They’ll also be added to the ${result.teamName} team when they join.`
      : 'They can sign in as soon as they accept.';
  });

  private readonly roles = computed(() =>
    this.workspace.access().canManage ? MANAGER_ROLES : MEMBER_ROLES,
  );
  protected readonly roleOptions = computed<readonly SelectOption[]>(() =>
    this.roles().map((role) => ({ value: role, label: WORKSPACE_ROLE_LABELS[role] })),
  );
  protected readonly role = linkedSignal<string>(() => {
    const preferred = this.workspace.preferences()?.defaultRole ?? FALLBACK_ROLE;
    return this.roles().includes(preferred) ? preferred : FALLBACK_ROLE;
  });
  protected readonly roleHelp = computed(
    () => WORKSPACE_ROLE_DETAILS.find((details) => details.role === this.role())?.description ?? '',
  );

  protected readonly teamOptions = computed<readonly SelectOption[]>(() => [
    { value: '', label: 'No team' },
    ...this.workspace.teams().map((team) => ({ value: team.id, label: team.name })),
  ]);
  protected readonly teamId = linkedSignal<string>(() => {
    const requested = this.data?.teamId ?? '';
    return this.workspace.teamIds().has(requested) ? requested : '';
  });

  private readonly allowedDomains = computed(() => allowedDomainsOf(this.workspace.preferences()));
  private readonly memberEmails = computed(
    () => new Set(this.workspace.members().map((member) => member.email.toLowerCase())),
  );
  private readonly checked = computed(() =>
    checkEmailRows(this.rows(), {
      memberEmails: this.memberEmails(),
      allowedDomains: this.allowedDomains(),
      invitedAt: (email) => this.invites.pendingFor(email)?.invitedAt ?? null,
    }),
  );
  private readonly summary = computed(() => summarizeRows(this.checked()));

  protected readonly rowViews = computed<readonly EmailRowView[]>(() =>
    this.checked().map((row) => ({
      id: row.id,
      value: row.value,
      message: rowMessageOf(row, this.tried(), this.allowedDomains()),
    })),
  );
  protected readonly countLabel = computed(() => inviteCountLabel(this.summary()));
  protected readonly policy = computed(() => domainPolicyOf(this.allowedDomains()));
  protected readonly banner = computed(() =>
    this.tried() ? inviteBannerOf(this.summary(), this.workspaceName()) : '',
  );
  protected readonly submitLabel = computed(() =>
    submitLabelOf(this.busy(), this.summary().sendable.length),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.sendTimer));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.busy() || this.result()) {
      return;
    }
    const summary = this.summary();
    if (summary.errors.length || !summary.sendable.length) {
      this.reject(summary);
      return;
    }
    this.tried.set(false);
    this.busy.set(true);
    this.sendTimer = setTimeout(() => void this.send(summary), SEND_DELAY_MS);
  }

  protected inviteMore(): void {
    const rows = freshRows(this.rows());
    this.result.set(null);
    this.tried.set(false);
    this.rows.set(rows);
    afterNextRender(() => this.emailRows()?.focusRow(rows[0].id), { injector: this.injector });
  }

  protected close(): void {
    this.dialogRef.close();
  }

  private reject(summary: RowsSummary): void {
    this.tried.set(true);
    const firstBad = summary.errors[0] ?? (summary.filled.length ? undefined : this.rows()[0]);
    this.emailRows()?.focusRow(firstBad?.id ?? null);
  }

  private async send(summary: RowsSummary): Promise<void> {
    const emails = summary.sendable.map((row) => row.email);
    const role = roleOf(this.role());
    const teamId = this.teamId() || null;
    const queued = this.network.offline();
    const outcome = await this.invites.invite({ emails, role, teamId, queued });
    this.activity.record({
      kind: 'invite',
      verb: 'invited',
      object: invitedObject(emails),
      route: PENDING_INVITES_ROUTE,
    });
    this.busy.set(false);
    this.result.set({
      emails,
      resent: new Set(outcome.resent.map((invite) => invite.email.toLowerCase())),
      skipped: summary.skipped.map((row) => row.email),
      roleLabel: WORKSPACE_ROLE_LABELS[role],
      teamName: teamId ? (this.workspace.team(teamId)?.name ?? '') : '',
      queued,
    });
    afterNextRender(() => this.doneButton()?.nativeElement.focus(), { injector: this.injector });
  }
}
