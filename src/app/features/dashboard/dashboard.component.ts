import { Component, computed, inject } from '@angular/core';
import { LoadStatus } from '../../core/models/load-status';
import { firstNameOf } from '../../core/models/user';
import { SearchService } from '../../core/services/search.service';
import { ToastService } from '../../core/services/toast.service';
import { ChatState } from '../../core/state/chat.state';
import { FileState } from '../../core/state/file.state';
import { NotificationState } from '../../core/state/notification.state';
import { TaskState } from '../../core/state/task.state';
import { WorkspaceActivityState } from '../../core/state/workspace-activity.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { TaskActions } from '../tasks/task-actions.service';
import { WorkspaceActions } from '../workspace/workspace-actions.service';
import {
  byDueDate,
  tasksDueToday,
  toActivity,
  toStats,
  toTeamActivity,
  toUpcomingTask,
  upcomingTasks,
} from './dashboard-view';
import { RecentActivityComponent } from './recent-activity/recent-activity.component';
import { RecentConversationsComponent } from './recent-conversations/recent-conversations.component';
import { StatAvailability, StatCardComponent } from './stat-card/stat-card.component';
import { TeamActivityComponent } from './team-activity/team-activity.component';
import { UpcomingTasksComponent } from './upcoming-tasks/upcoming-tasks.component';
import { WelcomeCardComponent } from './welcome-card/welcome-card.component';

const RECENT_CONVERSATION_LIMIT = 5;

const AVAILABILITY: Partial<Record<LoadStatus, StatAvailability>> = {
  loading: 'loading',
  error: 'unavailable',
};

const availabilityOf = (status: LoadStatus): StatAvailability => AVAILABILITY[status] ?? 'ready';

const firstUnsettled = (statuses: readonly LoadStatus[]): LoadStatus =>
  statuses.find((status) => status !== 'ready') ?? 'ready';

const emptyWhenNone = (status: LoadStatus, count: number): LoadStatus =>
  status === 'ready' && count === 0 ? 'empty' : status;

@Component({
  selector: 'app-dashboard',
  imports: [
    WelcomeCardComponent,
    StatCardComponent,
    RecentConversationsComponent,
    UpcomingTasksComponent,
    TeamActivityComponent,
    RecentActivityComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly workspace = inject(WorkspaceState);
  private readonly activityState = inject(WorkspaceActivityState);
  private readonly chat = inject(ChatState);
  private readonly tasks = inject(TaskState);
  private readonly notifications = inject(NotificationState);
  private readonly files = inject(FileState);
  private readonly search = inject(SearchService);
  private readonly taskActions = inject(TaskActions);
  private readonly workspaceActions = inject(WorkspaceActions);
  private readonly toasts = inject(ToastService);

  protected readonly workspaceStatus = this.workspace.status;
  protected readonly conversationStatus = computed(() =>
    firstUnsettled([this.workspace.loadStatus(), this.chat.inboxStatus()]),
  );
  protected readonly overallStatus = computed(() =>
    firstUnsettled([
      this.workspace.loadStatus(),
      this.chat.status(),
      this.tasks.loadStatus(),
      this.notifications.loadStatus(),
    ]),
  );
  protected readonly statAvailability = computed(() => availabilityOf(this.overallStatus()));

  protected readonly firstName = computed(() =>
    firstNameOf(this.workspace.currentUser()?.name ?? ''),
  );
  protected readonly unreadMentions = this.notifications.unreadMentionCount;
  protected readonly workspaceName = computed(() => this.workspace.currentWorkspace()?.name ?? '');

  protected readonly conversations = computed(() =>
    this.chat.previews().slice(0, RECENT_CONVERSATION_LIMIT),
  );
  private readonly openTasks = computed(() =>
    byDueDate(this.tasks.openTasks()).map((task) =>
      toUpcomingTask(task, this.workspace.user(task.assigneeId)),
    ),
  );
  protected readonly upcoming = computed(() => upcomingTasks(this.openTasks()));
  protected readonly taskStatus = computed(() =>
    emptyWhenNone(this.tasks.status(), this.upcoming().length),
  );
  protected readonly dueToday = computed(() => tasksDueToday(this.openTasks()));
  protected readonly teams = computed(() => toTeamActivity(this.workspace.teams()));
  private readonly visibleMembers = this.workspace.memberDirectory;
  protected readonly activity = computed(() =>
    toActivity(this.activityState.events({ category: 'activity' }), (userId) =>
      this.workspace.user(userId),
    ),
  );
  protected readonly activityStatus = computed(() =>
    emptyWhenNone(
      firstUnsettled([this.workspace.loadStatus(), this.activityState.status()]),
      this.activity().length,
    ),
  );
  protected readonly stats = computed(() =>
    toStats({
      joinedTeams: this.workspace.joinedTeams(),
      workspaceTeams: this.workspace.teams(),
      unreadMessages: this.chat.unreadTotal(),
      unreadConversations: this.chat.unreadConversationCount(),
      openTasks: this.openTasks(),
      onlineMembers: this.visibleMembers().filter((member) => member.status === 'online').length,
      knownMembers: this.visibleMembers().length,
      workspace: this.workspace.currentWorkspace(),
      dataEmpty: this.overallStatus() === 'empty',
    }),
  );

  protected startConversation(): void {
    this.search.open('people');
  }

  protected newTask(): void {
    this.taskActions.newTask();
  }

  protected invitePeople(): void {
    this.workspaceActions.openInvite();
  }

  protected async upload(fileNames: readonly string[]): Promise<void> {
    for (const fileName of fileNames) {
      await this.files.upload(fileName);
      this.toasts.show(`${fileName} uploaded`, { icon: 'upload' });
    }
  }

  protected reloadWorkspace(): void {
    void this.workspace.reload();
  }

  protected reloadActivity(): void {
    void this.workspace.reload();
    void this.activityState.reload();
  }

  protected reloadConversations(): void {
    void this.workspace.reload();
    void this.chat.reload();
  }

  protected reloadTasks(): void {
    void this.tasks.reload();
  }
}
