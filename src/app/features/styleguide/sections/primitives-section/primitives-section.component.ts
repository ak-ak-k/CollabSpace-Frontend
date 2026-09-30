import { Component, signal } from '@angular/core';
import { PresenceStatus } from '../../../../core/models/user';
import { BrandMarkComponent } from '../../../../shared/components/brand-mark/brand-mark.component';
import {
  AvatarGroupComponent,
  AvatarGroupMember,
} from '../../../../shared/ui/avatar-group/avatar-group.component';
import { AvatarComponent, AvatarSize } from '../../../../shared/ui/avatar/avatar.component';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { StatusDotComponent } from '../../../../shared/ui/status-dot/status-dot.component';
import { TagComponent } from '../../../../shared/ui/tag/tag.component';

interface Person {
  readonly id: string;
  readonly name: string;
  readonly seed: number;
  readonly status: PresenceStatus;
}

const PEOPLE: readonly Person[] = [
  { id: 'u0', name: 'Aarav Shah', seed: 0, status: 'online' },
  { id: 'u1', name: 'Rahul Mehta', seed: 1, status: 'online' },
  { id: 'u2', name: 'Priya Sharma', seed: 2, status: 'away' },
  { id: 'u3', name: 'Daniel Kim', seed: 3, status: 'offline' },
  { id: 'u4', name: 'Kavya Reddy', seed: 4, status: 'online' },
  { id: 'u5', name: 'Ananya Iyer', seed: 5, status: 'dnd' },
];

@Component({
  selector: 'app-styleguide-primitives-section',
  imports: [
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    SpinnerComponent,
    AvatarComponent,
    AvatarGroupComponent,
    BadgeComponent,
    TagComponent,
    StatusDotComponent,
    BrandMarkComponent,
  ],
  templateUrl: './primitives-section.component.html',
  styleUrl: './primitives-section.component.scss',
})
export class PrimitivesSectionComponent {
  protected readonly people = PEOPLE;
  protected readonly members: readonly AvatarGroupMember[] = PEOPLE;
  protected readonly avatarSizes: readonly AvatarSize[] = [24, 28, 32, 40, 44, 56, 72];
  protected readonly statuses: readonly PresenceStatus[] = ['online', 'away', 'dnd', 'offline'];
  protected readonly counts = [1, 7, 42, 120];
  protected readonly starred = signal(false);
}
