import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { AppNotification, NOTIFICATION_CATEGORIES } from '../../../core/models/notification';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ToastService } from '../../../core/services/toast.service';
import { NotificationState } from '../../../core/state/notification.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TabItem, TabsComponent } from '../../../shared/ui/tabs/tabs.component';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { NotificationSidebarComponent } from '../notification-sidebar/notification-sidebar.component';
import { NotificationsHeaderComponent } from '../notifications-header/notifications-header.component';
import {
  categoryLinkOf,
  emptyMessageOf,
  groupNotificationsByDay,
  markAllLabelOf,
  matchesNotificationFilter,
  NotificationCategoryView,
  notificationFilterOf,
  NotificationShowFilter,
  notificationSummaryOf,
  visibleNotifications,
} from '../notifications-view';

type NotificationsBody = 'loading' | 'error' | 'empty' | 'list';

@Component({
  selector: 'app-notifications-page',
  imports: [
    EmptyStateComponent,
    NotificationListComponent,
    NotificationSidebarComponent,
    NotificationsHeaderComponent,
    SkeletonComponent,
    TabsComponent,
  ],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
})
export class NotificationsPageComponent {
  private readonly state = inject(NotificationState);
  private readonly workspace = inject(WorkspaceState);
  private readonly toast = inject(ToastService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  readonly category = input<string>();

  protected readonly isDesktop = inject(BreakpointService).isDesktop;
  protected readonly show = signal('all');
  protected readonly filter = computed(() => notificationFilterOf(this.category()));

  private readonly header = viewChild.required(NotificationsHeaderComponent);
  private readonly list = viewChild(NotificationListComponent);

  private readonly ready = computed(() => this.state.status() === 'ready');
  private readonly showFilter = computed<NotificationShowFilter>(() =>
    this.show() === 'unread' ? 'unread' : 'all',
  );
  private readonly inCategory = computed(() =>
    this.state
      .notifications()
      .filter((notification) => matchesNotificationFilter(notification, this.filter())),
  );
  private readonly unreadInCategory = computed(
    () => this.inCategory().filter((notification) => !notification.read).length,
  );
  private readonly visible = computed(() =>
    visibleNotifications(this.state.notifications(), this.filter(), this.showFilter()),
  );

  protected readonly categories = computed<readonly NotificationCategoryView[]>(() =>
    NOTIFICATION_CATEGORIES.map((option) => ({
      ...option,
      unreadCount: this.ready() ? this.state.unreadCountFor(option.id) : 0,
      link: categoryLinkOf(option.id),
      current: option.id === this.filter(),
    })),
  );
  protected readonly tabs = computed<readonly TabItem[]>(() =>
    this.categories().map((category) => ({
      id: category.id,
      label: category.label,
      count: category.unreadCount,
      countLabel: 'unread',
      link: category.link,
    })),
  );
  protected readonly summary = computed(() =>
    notificationSummaryOf(this.unreadInCategory(), this.inCategory().length, this.ready()),
  );
  protected readonly canMarkAllRead = computed(() => this.ready() && this.unreadInCategory() > 0);
  protected readonly markAllLabel = computed(() => markAllLabelOf(this.filter()));
  protected readonly emptyMessage = computed(() => emptyMessageOf(this.showFilter()));
  protected readonly groups = computed(() =>
    groupNotificationsByDay(this.visible(), this.workspace.usersById(), Date.now()),
  );
  protected readonly body = computed<NotificationsBody>(() => {
    const status = this.state.status();
    if (status === 'loading' || this.workspace.status() === 'loading') {
      return 'loading';
    }
    if (status === 'error') {
      return 'error';
    }
    return this.ready() && this.visible().length > 0 ? 'list' : 'empty';
  });

  protected open(id: string): void {
    if (this.find(id)?.read === false) {
      void this.state.setRead(id, true);
    }
  }

  protected toggleRead(id: string): void {
    const notification = this.find(id);
    if (notification) {
      this.restoreFocusIfRemoved(id);
      void this.state.setRead(id, !notification.read);
    }
  }

  protected dismiss(id: string): void {
    const notification = this.find(id);
    if (!notification) {
      return;
    }
    this.restoreFocusIfRemoved(id);
    void this.state.dismiss(id);
    this.toast.show('Notification dismissed', {
      icon: 'x',
      actionLabel: 'Undo',
      onAction: () => void this.state.restore(notification),
    });
  }

  protected markAllRead(): void {
    const filter = this.filter();
    const markedIds = this.state
      .unread()
      .filter((notification) => matchesNotificationFilter(notification, filter))
      .map((notification) => notification.id);
    void this.state.markAllRead(filter);
    this.toast.show('All caught up', {
      icon: 'check-check',
      actionLabel: 'Undo',
      onAction: () => markedIds.forEach((id) => void this.state.setRead(id, false)),
    });
  }

  protected reload(): void {
    void this.state.reload();
  }

  private find(id: string): AppNotification | undefined {
    return this.state.notifications().find((notification) => notification.id === id);
  }

  private restoreFocusIfRemoved(id: string): void {
    const removedIndex = this.visible().findIndex((notification) => notification.id === id);
    afterNextRender(() => this.focusNear(id, removedIndex), { injector: this.injector });
  }

  private focusNear(id: string, removedIndex: number): void {
    const remainingIds = this.visible().map((notification) => notification.id);
    const focusLost = this.document.activeElement === this.document.body;
    if (remainingIds.includes(id) || !focusLost) {
      return;
    }
    const nextId = remainingIds.at(Math.min(removedIndex, remainingIds.length - 1));
    if (nextId) {
      this.list()?.focusRow(nextId);
    } else {
      this.header().focusTitle();
    }
  }
}
