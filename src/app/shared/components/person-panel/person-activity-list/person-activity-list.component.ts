import { booleanAttribute, Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { personActivityOf } from '../../../../core/state/person-activity';
import { ChatState } from '../../../../core/state/chat.state';
import { WorkspaceActivityState } from '../../../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../../../core/state/workspace.state';
import { formatRelative } from '../../../pipes/time-format';
import { IconComponent } from '../../../ui/icon/icon.component';

@Component({
  selector: 'app-person-activity-list',
  imports: [IconComponent, RouterLink],
  templateUrl: './person-activity-list.component.html',
  styleUrl: './person-activity-list.component.scss',
  host: { '[class.activity--clamped]': 'clampSnippets()' },
})
export class PersonActivityListComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly workspaceActivity = inject(WorkspaceActivityState);
  private readonly chat = inject(ChatState);
  private readonly router = inject(Router);

  readonly userId = input.required<string>();
  readonly clampSnippets = input(false, { transform: booleanAttribute });
  readonly navigate = output<void>();

  protected readonly workspaceName = computed(
    () => this.workspace.currentWorkspace()?.name ?? 'this workspace',
  );

  protected readonly items = computed(() => {
    const now = Date.now();
    const sources = {
      events: this.workspaceActivity.events({ category: 'activity', actorId: this.userId() }),
      channels: this.workspace.channels(),
      messages: this.chat.messages(),
    };
    return personActivityOf(this.userId(), sources).map((item) => ({
      ...item,
      link: item.route ? this.router.parseUrl(item.route) : null,
      when: formatRelative(item.occurredAt, now),
    }));
  });
}
