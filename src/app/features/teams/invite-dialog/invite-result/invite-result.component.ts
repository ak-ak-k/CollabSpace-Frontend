import { Component, computed, input } from '@angular/core';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../../shared/ui/tag/tag.component';

export interface InviteResult {
  readonly emails: readonly string[];
  readonly resent: ReadonlySet<string>;
  readonly skipped: readonly string[];
  readonly roleLabel: string;
  readonly teamName: string;
  readonly queued: boolean;
}

const headingOf = (count: number, queued: boolean): string => {
  const state = queued ? 'queued' : 'sent';
  return count === 1 ? `Invitation ${state}` : `${count} invitations ${state}`;
};

const detailOf = (result: InviteResult): string => {
  if (result.queued) {
    return 'You’re offline. They’ll send as soon as you reconnect.';
  }
  const recipients = result.emails.length === 1 ? result.emails[0] : 'everyone below';
  return `We emailed ${recipients}. You can track or revoke pending invitations in Workspace settings.`;
};

@Component({
  selector: 'app-invite-result',
  imports: [IconComponent, TagComponent],
  templateUrl: './invite-result.component.html',
  styleUrl: './invite-result.component.scss',
})
export class InviteResultComponent {
  readonly result = input.required<InviteResult>();

  protected readonly heading = computed(() =>
    headingOf(this.result().emails.length, this.result().queued),
  );
  protected readonly detail = computed(() => detailOf(this.result()));
  protected readonly icon = computed(() => (this.result().queued ? 'clock' : 'mail-check'));
  protected readonly itemIcon = computed(() => (this.result().queued ? 'clock' : 'check'));

  protected isResent(email: string): boolean {
    return this.result().resent.has(email.toLowerCase());
  }
}
