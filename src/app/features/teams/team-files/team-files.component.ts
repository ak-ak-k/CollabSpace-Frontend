import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoadStatus } from '../../../core/models/load-status';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TeamFileView } from '../team-view';

const RECENT_FILES_LINK = ['/files', 'recent'];

@Component({
  selector: 'app-team-files',
  imports: [
    RouterLink,
    ButtonComponent,
    EmptyStateComponent,
    IconButtonComponent,
    IconComponent,
    SkeletonComponent,
  ],
  templateUrl: './team-files.component.html',
  styleUrl: './team-files.component.scss',
})
export class TeamFilesComponent {
  readonly teamId = input.required<string>();
  readonly files = input.required<readonly TeamFileView[]>();
  readonly status = input<LoadStatus>('ready');

  readonly download = output<string>();
  readonly retry = output<void>();

  protected readonly filesLink = RECENT_FILES_LINK;
  protected readonly filesQuery = computed(() => ({ team: this.teamId() }));
}
