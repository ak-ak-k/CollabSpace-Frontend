import {
  afterNextRender,
  Component,
  computed,
  DOCUMENT,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { DeviceSession } from '../../../core/models/preferences';
import { ToastService } from '../../../core/services/toast.service';
import { PreferencesState } from '../../../core/state/preferences.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';

@Component({
  selector: 'app-session-list',
  imports: [ButtonComponent, EmptyStateComponent, IconComponent, SkeletonComponent, TagComponent],
  templateUrl: './session-list.component.html',
  styleUrl: './session-list.component.scss',
})
export class SessionListComponent {
  private readonly state = inject(PreferencesState);
  private readonly toasts = inject(ToastService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');
  private readonly revokeButtons = viewChildren('revokeButton', {
    read: ElementRef<HTMLButtonElement>,
  });
  private readonly revokedIds = signal<ReadonlySet<string>>(new Set());

  protected readonly status = this.state.status;
  protected readonly sessions = computed(() =>
    this.state.sessions().filter((session) => !this.revokedIds().has(session.id)),
  );
  protected readonly canSignOutOthers = computed(
    () => this.status() === 'ready' && this.sessions().some((session) => !session.current),
  );

  protected revoke(session: DeviceSession): void {
    this.hide([session.id]);
    void this.state.revokeSession(session.id);
    this.toasts.show(`Signed out of ${session.device}`, { icon: 'log-out' });
  }

  protected revokeOthers(): void {
    this.hide(this.state.otherSessions().map((session) => session.id));
    void this.state.revokeOtherSessions();
    this.toasts.show('Signed out of all other sessions', { icon: 'log-out' });
  }

  protected reload(): void {
    void this.state.reload();
  }

  private hide(ids: readonly string[]): void {
    this.revokedIds.update((revoked) => new Set([...revoked, ...ids]));
    afterNextRender(() => this.focusNextControl(), { injector: this.injector });
  }

  private focusNextControl(): void {
    const active = this.document.activeElement;
    if (active && active !== this.document.body && active.isConnected) {
      return;
    }
    const target = this.revokeButtons().at(0)?.nativeElement ?? this.heading().nativeElement;
    target.focus();
  }
}
