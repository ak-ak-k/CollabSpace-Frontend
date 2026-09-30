import { Component, input, output } from '@angular/core';
import { LoadStatus } from '../../../core/models/load-status';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TeamFileView } from '../team-view';

@Component({
  selector: 'app-team-files',
  imports: [EmptyStateComponent, IconButtonComponent, IconComponent, SkeletonComponent],
  templateUrl: './team-files.component.html',
  styleUrl: './team-files.component.scss',
})
export class TeamFilesComponent {
  readonly files = input.required<readonly TeamFileView[]>();
  readonly status = input<LoadStatus>('ready');

  readonly download = output<string>();
  readonly retry = output<void>();
}
