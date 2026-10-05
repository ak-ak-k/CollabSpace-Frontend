import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstNameOf, PRESENCE_LABELS, User, userColorSeed } from '../../../core/models/user';
import { WORKSPACE_ROLE_LABELS } from '../../../core/models/workspace-role';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { StatusDotComponent } from '../../../shared/ui/status-dot/status-dot.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';

const MOBILE_AVATAR_SIZE = 96;
const AVATAR_SIZE = 128;

@Component({
  selector: 'app-profile-header',
  imports: [
    AvatarComponent,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    RouterLink,
    StatusDotComponent,
    TagComponent,
  ],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss',
})
export class ProfileHeaderComponent {
  private readonly breakpoint = inject(BreakpointService);

  readonly user = input.required<User>();
  readonly self = input(true, { transform: booleanAttribute });
  readonly statusMessage = input('');
  readonly editing = input(false, { transform: booleanAttribute });
  readonly saving = input(false, { transform: booleanAttribute });

  readonly edit = output<void>();
  readonly cancel = output<void>();
  readonly save = output<void>();
  readonly changePhoto = output<void>();
  readonly message = output<void>();

  private readonly editButton = viewChild('editButton', { read: ElementRef<HTMLButtonElement> });

  protected readonly avatarSize = computed(() =>
    this.breakpoint.isMobile() ? MOBILE_AVATAR_SIZE : AVATAR_SIZE,
  );
  protected readonly seed = computed(() => userColorSeed(this.user().id));
  protected readonly roleLabel = computed(() => WORKSPACE_ROLE_LABELS[this.user().role]);
  protected readonly statusLabel = computed(() => PRESENCE_LABELS[this.user().status]);
  protected readonly firstName = computed(() => firstNameOf(this.user().name));

  focusEdit(): void {
    this.editButton()?.nativeElement.focus();
  }
}
