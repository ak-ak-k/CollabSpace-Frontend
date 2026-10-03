import { booleanAttribute, Component, inject, input } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { StatusDotComponent } from '../../../shared/ui/status-dot/status-dot.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { MemberActions } from '../member-actions.service';
import { MemberMenuComponent } from '../member-menu/member-menu.component';
import { MemberRow } from '../members-view';

@Component({
  selector: 'app-members-table',
  imports: [AvatarComponent, MemberMenuComponent, StatusDotComponent, TagComponent],
  templateUrl: './members-table.component.html',
  styleUrl: './members-table.component.scss',
  host: {
    '[class.members-table--wide]': 'wide()',
  },
})
export class MembersTableComponent {
  private readonly actions = inject(MemberActions);

  readonly rows = input.required<readonly MemberRow[]>();
  readonly caption = input.required<string>();
  readonly wide = input(false, { transform: booleanAttribute });

  protected openProfile(member: MemberRow): void {
    this.actions.openProfile(member.id);
  }
}
