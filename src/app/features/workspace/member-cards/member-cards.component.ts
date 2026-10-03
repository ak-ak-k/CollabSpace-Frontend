import { Component, inject, input } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { MemberActions } from '../member-actions.service';
import { MemberMenuComponent } from '../member-menu/member-menu.component';
import { MemberRow } from '../members-view';

@Component({
  selector: 'app-member-cards',
  imports: [AvatarComponent, MemberMenuComponent, TagComponent],
  templateUrl: './member-cards.component.html',
  styleUrl: './member-cards.component.scss',
})
export class MemberCardsComponent {
  private readonly actions = inject(MemberActions);

  readonly rows = input.required<readonly MemberRow[]>();
  readonly label = input.required<string>();

  protected openProfile(member: MemberRow): void {
    this.actions.openProfile(member.id);
  }
}
