import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ConversationComponent } from '../../messages/conversation/conversation.component';

@Component({
  selector: 'app-team-channel',
  imports: [ConversationComponent, EmptyStateComponent, SkeletonComponent],
  templateUrl: './team-channel.component.html',
  styleUrl: './team-channel.component.scss',
})
export class TeamChannelComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly router = inject(Router);

  readonly teamId = input.required<string>();
  readonly channelId = input.required<string>();

  protected readonly teamLink = computed(() => `/teams/${this.teamId()}`);
  protected readonly status = this.workspace.status;
  protected readonly belongsToTeam = computed(
    () => this.workspace.team(this.teamId())?.channelIds.includes(this.channelId()) ?? false,
  );

  protected backToTeam(): void {
    void this.router.navigateByUrl(this.teamLink());
  }
}
