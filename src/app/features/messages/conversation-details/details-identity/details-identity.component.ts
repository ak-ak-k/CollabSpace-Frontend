import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ConnectionGuard } from '../../../../core/services/connection-guard.service';
import { CountPipe } from '../../../../shared/pipes/count.pipe';
import { AvatarComponent } from '../../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { StatusDotComponent } from '../../../../shared/ui/status-dot/status-dot.component';
import { TagComponent } from '../../../../shared/ui/tag/tag.component';
import { ConversationView } from '../../conversation/conversation-view';
import { MembershipActions } from '../../membership-actions.service';

export const GROUP_NAME_MAX_LENGTH = 60;

@Component({
  selector: 'app-details-identity',
  imports: [
    CountPipe,
    AvatarComponent,
    ButtonComponent,
    IconComponent,
    InputComponent,
    StatusDotComponent,
    TagComponent,
  ],
  templateUrl: './details-identity.component.html',
  styleUrl: './details-identity.component.scss',
})
export class DetailsIdentityComponent {
  private readonly membership = inject(MembershipActions);
  private readonly connection = inject(ConnectionGuard);
  private readonly injector = inject(Injector);

  readonly view = input.required<ConversationView>();
  readonly canRename = input(false, { transform: booleanAttribute });

  protected readonly nameMaxLength = GROUP_NAME_MAX_LENGTH;
  protected readonly renaming = signal(false);
  protected readonly draftName = signal('');
  protected readonly mailto = computed(() => `mailto:${this.view().profile?.email ?? ''}`);

  private readonly nameField = viewChild(InputComponent);

  protected startRename(): void {
    this.draftName.set(this.view().title);
    this.renaming.set(true);
    afterNextRender(() => this.nameField()?.focus(), { injector: this.injector });
  }

  protected cancelRename(event: Event): void {
    event.stopPropagation();
    this.renaming.set(false);
  }

  protected saveRename(event: Event): void {
    event.preventDefault();
    const name = this.draftName().trim();
    const renamed = name !== '' && name !== this.view().title;
    if (renamed && !this.connection.allows('renameGroup')) {
      return;
    }
    this.renaming.set(false);
    if (renamed) {
      void this.membership.renameGroup(this.view().id, name);
    }
  }
}
