import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SystemPageComponent, USEFUL_PLACES } from '../system-page/system-page.component';

const DEFAULT_RESOURCE = '#leadership';
const DEFAULT_TEAM = 'Platform';

const orDefault =
  (fallback: string) =>
  (value: string | undefined): string =>
    value?.trim() || fallback;

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink, SystemPageComponent, ButtonComponent, IconComponent],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss',
})
export class ForbiddenComponent {
  private readonly toasts = inject(ToastService);

  readonly resource = input(DEFAULT_RESOURCE, { transform: orDefault(DEFAULT_RESOURCE) });
  readonly team = input(DEFAULT_TEAM, { transform: orDefault(DEFAULT_TEAM) });

  protected readonly lists = [USEFUL_PLACES];
  protected readonly heading = computed(() => `You don’t have access to ${this.resource()}`);
  protected readonly message = computed(
    () =>
      `This is a private channel in the ${this.team()} team. Only its members can see its messages and files. You can ask an admin to add you.`,
  );

  protected requestAccess(): void {
    this.toasts.show('Access requested — Kavya Reddy will be notified', {
      icon: 'send-horizontal',
    });
  }
}
