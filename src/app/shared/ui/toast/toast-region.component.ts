import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, effect, ElementRef, inject, untracked } from '@angular/core';
import { Toast, ToastService } from '../../../core/services/toast.service';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../icon/icon.component';

const HIDDEN_FROM_ASSISTIVE_TECHNOLOGY = '[aria-hidden="true"]';

@Component({
  selector: 'app-toast-region',
  imports: [IconButtonComponent, IconComponent],
  templateUrl: './toast-region.component.html',
  styleUrl: './toast-region.component.scss',
  host: {
    role: 'region',
    'aria-label': 'Notifications',
    'aria-live': 'polite',
  },
})
export class ToastRegionComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly announcer = inject(LiveAnnouncer);
  private lastAnnouncedId: string | undefined;

  protected readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.toasts;

  constructor() {
    effect(() => {
      const latest = this.toasts().at(-1);
      untracked(() => this.announceWhenRegionIsHidden(latest));
    });
  }

  private announceWhenRegionIsHidden(latest: Toast | undefined): void {
    const isNew = latest !== undefined && latest.id !== this.lastAnnouncedId;
    this.lastAnnouncedId = latest?.id ?? this.lastAnnouncedId;
    if (isNew && this.host.closest(HIDDEN_FROM_ASSISTIVE_TECHNOLOGY)) {
      void this.announcer.announce(latest.message, 'polite');
    }
  }
}
