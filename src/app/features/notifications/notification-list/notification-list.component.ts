import { Component, input, output, viewChildren } from '@angular/core';
import { NotificationRowComponent } from '../notification-row/notification-row.component';
import { NotificationGroupView } from '../notifications-view';

@Component({
  selector: 'app-notification-list',
  imports: [NotificationRowComponent],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent {
  readonly groups = input.required<readonly NotificationGroupView[]>();
  readonly opened = output<string>();
  readonly readToggled = output<string>();
  readonly dismissed = output<string>();

  private readonly rows = viewChildren(NotificationRowComponent);

  focusRow(id: string): void {
    this.rows()
      .find((row) => row.notification().id === id)
      ?.focus();
  }
}
