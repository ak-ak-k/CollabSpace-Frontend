import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NetworkState } from '../../../core/state/network.state';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-registry';

export type SystemTileTone = 'inverted' | 'warning' | 'danger';

export interface SystemListItem {
  readonly label: string;
  readonly icon: IconName;
  readonly link?: string;
  readonly tone?: 'success' | 'muted';
}

export interface SystemList {
  readonly title: string;
  readonly items: readonly SystemListItem[];
}

export const WORKS_OFFLINE: SystemList = {
  title: 'Works offline',
  items: [
    { label: 'Conversations you’ve already opened', icon: 'check', tone: 'success' },
    { label: 'Drafts and queued messages', icon: 'check', tone: 'success' },
    { label: 'Your task board (read-only)', icon: 'check', tone: 'success' },
  ],
};

export const NEEDS_CONNECTION: SystemList = {
  title: 'Needs a connection',
  items: [
    { label: 'Sending messages and reactions', icon: 'clock', tone: 'muted' },
    { label: 'Search across the workspace', icon: 'clock', tone: 'muted' },
    { label: 'File uploads and downloads', icon: 'clock', tone: 'muted' },
  ],
};

export const USEFUL_PLACES: SystemList = {
  title: 'Useful places',
  items: [
    { label: 'Dashboard', icon: 'house', link: '/home' },
    { label: 'Messages', icon: 'message-square', link: '/messages' },
    { label: 'Tasks board', icon: 'square-kanban', link: '/tasks' },
    { label: 'Files', icon: 'folder', link: '/files' },
  ],
};

@Component({
  selector: 'app-system-page',
  imports: [RouterLink, IconComponent],
  templateUrl: './system-page.component.html',
  styleUrl: './system-page.component.scss',
})
export class SystemPageComponent {
  protected readonly network = inject(NetworkState);

  readonly kicker = input.required<string>();
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  readonly code = input('');
  readonly icon = input<IconName>();
  readonly tileTone = input<SystemTileTone>('inverted');
  readonly lists = input<readonly SystemList[]>([]);
}
