import { booleanAttribute, Component, inject, input } from '@angular/core';
import { AvatarComponent } from '../../../../shared/ui/avatar/avatar.component';
import { IconButtonComponent } from '../../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ConversationView, MemberView } from '../../conversation/conversation-view';
import { MembershipActions } from '../../membership-actions.service';

@Component({
  selector: 'app-details-members',
  imports: [AvatarComponent, IconButtonComponent, IconComponent],
  templateUrl: './details-members.component.html',
  styleUrl: './details-members.component.scss',
})
export class DetailsMembersComponent {
  private readonly membership = inject(MembershipActions);

  readonly view = input.required<ConversationView>();
  readonly canRemove = input(false, { transform: booleanAttribute });

  protected removeLabel(member: MemberView): string {
    return `Remove ${member.name} from the group`;
  }

  protected remove(member: MemberView): void {
    void this.membership.removeMember(this.view().id, member.id);
  }
}
