import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

export interface BreadcrumbItem {
  readonly label: string;
  readonly link?: string | readonly unknown[];
}

const PARENT_POSITION_FROM_END = -2;

@Component({
  selector: 'app-breadcrumb',
  imports: [IconComponent, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  host: {
    '[class.breadcrumb--collapsible]': 'parent() !== undefined',
  },
})
export class BreadcrumbComponent {
  readonly label = input('Breadcrumb');
  readonly items = input<readonly BreadcrumbItem[]>([]);

  protected readonly parent = computed(() => {
    const parent = this.items().at(PARENT_POSITION_FROM_END);
    return parent?.link === undefined ? undefined : parent;
  });
}
