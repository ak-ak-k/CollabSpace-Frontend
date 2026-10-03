import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { NotificationRowView } from '../notifications-view';

@Component({
  selector: 'li[appNotificationRow]',
  imports: [
    AvatarComponent,
    IconButtonComponent,
    IconComponent,
    NgTemplateOutlet,
    RouterLink,
    TagComponent,
  ],
  templateUrl: './notification-row.component.html',
  styleUrl: './notification-row.component.scss',
  host: {
    class: 'notification',
    '[class.notification--unread]': 'notification().unread',
  },
})
export class NotificationRowComponent {
  private readonly router = inject(Router);

  readonly notification = input.required<NotificationRowView>();
  readonly opened = output<void>();
  readonly readToggled = output<void>();
  readonly dismissed = output<void>();

  private readonly contentLink = viewChild<ElementRef<HTMLElement>>('contentLink');
  private readonly toggleButton = viewChild.required('toggleButton', { read: ElementRef });

  protected readonly link = computed(() => {
    const route = this.notification().route;
    return route ? this.router.parseUrl(route) : null;
  });
  protected readonly toggleLabel = computed(() => {
    const action = this.notification().unread ? 'Mark as read' : 'Mark as unread';
    return `${action}: ${this.notification().summary}`;
  });
  protected readonly dismissLabel = computed(() => `Dismiss: ${this.notification().summary}`);

  focus(): void {
    const target = this.contentLink() ?? this.toggleButton();
    target.nativeElement.focus();
  }
}
