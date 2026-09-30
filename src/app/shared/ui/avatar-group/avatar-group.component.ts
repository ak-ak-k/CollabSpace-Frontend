import { booleanAttribute, Component, computed, input, numberAttribute } from '@angular/core';
import { AvatarComponent, AvatarSize } from '../avatar/avatar.component';

export interface AvatarGroupMember {
  readonly id: string;
  readonly name: string;
  readonly seed: number;
}

const DEFAULT_VISIBLE_MEMBERS = 3;

@Component({
  selector: 'app-avatar-group',
  imports: [AvatarComponent],
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.scss',
  host: { 'aria-hidden': 'true' },
})
export class AvatarGroupComponent {
  readonly members = input.required<readonly AvatarGroupMember[]>();
  readonly max = input(DEFAULT_VISIBLE_MEMBERS, { transform: numberAttribute });
  readonly size = input<AvatarSize>(26);
  readonly showOverflow = input(false, { transform: booleanAttribute });

  protected readonly visibleMembers = computed(() => this.members().slice(0, this.max()));
  protected readonly overflowCount = computed(() =>
    this.showOverflow() ? Math.max(0, this.members().length - this.max()) : 0,
  );
}
