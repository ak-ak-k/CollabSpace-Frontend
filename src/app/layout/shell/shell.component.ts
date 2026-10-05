import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, effect, ElementRef, inject, untracked, viewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { BreakpointService } from '../../core/services/breakpoint.service';
import { DialogService } from '../../core/services/dialog.service';
import { SearchService } from '../../core/services/search.service';
import { ToastService } from '../../core/services/toast.service';
import { ChatState } from '../../core/state/chat.state';
import { InviteState } from '../../core/state/invite.state';
import { NetworkState } from '../../core/state/network.state';
import { NotificationEngine } from '../../core/state/notification-engine';
import { PreferencesState } from '../../core/state/preferences.state';
import { SearchPaletteComponent } from '../../features/search/search-palette/search-palette.component';
import { OfflineBannerComponent } from '../../shared/components/offline-banner/offline-banner.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { CurrentRoute } from '../current-route';
import { DrawerMenuComponent } from '../drawer-menu/drawer-menu.component';
import { MobileHeaderComponent } from '../mobile-header/mobile-header.component';
import { RailComponent } from '../rail/rail.component';
import { WorkspaceBannerComponent } from '../workspace-banner/workspace-banner.component';
import { IncomingAlerts } from './incoming-alerts';
import { isPaletteShortcut, isQuickSearchKey, isTypingTarget } from './shortcuts';

const TITLE_SEPARATOR = ' · ';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RailComponent,
    MobileHeaderComponent,
    BottomNavComponent,
    OfflineBannerComponent,
    WorkspaceBannerComponent,
    SearchPaletteComponent,
  ],
  providers: [IncomingAlerts],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  host: {
    '(document:keydown)': 'handleShortcut($event)',
    '[class.shell--immersive]': 'immersive()',
  },
})
export class ShellComponent {
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly chat = inject(ChatState);
  private readonly invites = inject(InviteState);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly title = inject(Title);
  private readonly route = inject(CurrentRoute);

  protected readonly breakpoint = inject(BreakpointService);
  protected readonly network = inject(NetworkState);
  protected readonly search = inject(SearchService);
  protected readonly announcement = inject(NotificationEngine).announcement;

  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  private wasOnline = this.network.online();

  protected readonly immersive = () => this.breakpoint.isMobile() && this.route.inConversation();

  constructor() {
    inject(PreferencesState);
    inject(IncomingAlerts);
    effect(() => this.reactToNetwork(this.network.online()));
    effect(() => {
      this.route.path();
      untracked(() => this.announcePage());
    });
  }

  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.focusMain();
  }

  protected focusMain(): void {
    this.main().nativeElement.focus();
  }

  protected openDrawer(): void {
    this.dialogs.openDrawer(DrawerMenuComponent, { side: 'left', size: 'sm', ariaLabel: 'Menu' });
  }

  protected retryNetwork(): void {
    if (!this.network.retry()) {
      this.toasts.show('Still offline — we’ll keep trying', { icon: 'wifi-off' });
    }
  }

  protected handleShortcut(event: KeyboardEvent): void {
    if (isPaletteShortcut(event)) {
      event.preventDefault();
      this.search.toggle();
    } else if (isQuickSearchKey(event) && !isTypingTarget(event) && !this.search.isOpen()) {
      event.preventDefault();
      this.search.open();
    }
  }

  private reactToNetwork(online: boolean): void {
    if (online === this.wasOnline) {
      return;
    }
    this.wasOnline = online;
    untracked(() => (online ? this.welcomeBack() : this.warnOffline()));
  }

  private welcomeBack(): void {
    this.chat.flushQueue();
    void this.invites.flushQueued();
    this.toasts.show('Back online — queued messages and invitations sent', { icon: 'wifi' });
  }

  private warnOffline(): void {
    this.toasts.show('You’re offline', { icon: 'wifi-off' });
  }

  private announcePage(): void {
    queueMicrotask(() => {
      const pageName = this.title.getTitle().split(TITLE_SEPARATOR)[0];
      void this.announcer.announce(`${pageName} page`, 'polite');
    });
  }
}
