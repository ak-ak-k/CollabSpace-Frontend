import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AccessRequest,
  DASHBOARD_ROUTE,
  RouteBlock,
  RouteBlockKind,
} from '../../../core/models/route-block';
import { SearchService } from '../../../core/services/search.service';
import { ToastService } from '../../../core/services/toast.service';
import { NetworkState } from '../../../core/state/network.state';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import {
  SystemList,
  SystemPageComponent,
  USEFUL_PLACES,
} from '../system-page/system-page.component';

const ERROR_CODES: Record<RouteBlockKind, string> = {
  denied: '403',
  'not-found': '404',
};

const DEFAULT_LISTS: readonly SystemList[] = [USEFUL_PLACES];

@Component({
  selector: 'app-route-block',
  imports: [RouterLink, SystemPageComponent, ButtonComponent, IconComponent],
  templateUrl: './route-block.component.html',
  styleUrl: './route-block.component.scss',
})
export class RouteBlockComponent {
  private readonly toasts = inject(ToastService);
  private readonly network = inject(NetworkState);
  protected readonly search = inject(SearchService);

  readonly block = input.required<RouteBlock>();

  protected readonly dashboardRoute = DASHBOARD_ROUTE;
  protected readonly page = computed(() => this.block().context);
  protected readonly code = computed(() =>
    this.page().icon ? '' : ERROR_CODES[this.block().kind],
  );
  protected readonly lists = computed(() => (this.page().noLists ? [] : DEFAULT_LISTS));
  protected readonly backIsDashboard = computed(() => this.page().back.href === DASHBOARD_ROUTE);

  protected requestAccess(request: AccessRequest): void {
    if (this.network.offline()) {
      this.toasts.show('You’re offline — request access when you’re back online', {
        icon: 'cloud-off',
      });
      return;
    }
    this.toasts.show(`Access requested — ${request.owner || 'an admin'} will be notified`, {
      icon: 'send-horizontal',
    });
  }
}
