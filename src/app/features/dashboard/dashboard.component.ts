import { Component, computed, inject } from '@angular/core';
import { FilesData } from '../../core/data/files.data';
import { LoadStatus } from '../../core/models/load-status';
import { firstNameOf } from '../../core/models/user';
import { DialogService } from '../../core/services/dialog.service';
import { SearchService } from '../../core/services/search.service';
import { ToastService } from '../../core/services/toast.service';
import { ChatState } from '../../core/state/chat.state';
import { NotificationState } from '../../core/state/notification.state';
import { TaskState } from '../../core/state/task.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { TaskDialogComponent } from '../tasks/task-dialog/task-dialog.component';
import { InviteDialogComponent } from '../teams/invite-dialog/invite-dialog.component';
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
  private readonly chat = inject(ChatState);
  private readonly tasks = inject(TaskState);
  private readonly notifications = inject(NotificationState);
  private readonly files = inject(FilesData);
  private readonly search = inject(SearchService);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);

  protected readonly workspaceStatus = this.workspace.status;
  protected readonly taskStatus = this.tasks.status;
  protected readonly conversationStatus = computed(() =>
    firstUnsettled([this.workspace.status(), this.chat.status()]),
  );
  protected readonly overallStatus = computed(() =>
    firstUnsettled([
      this.workspace.status(),
      this.chat.status(),
      this.tasks.status(),
      this.notifications.status(),
    ]),
  );
  protected readonly statAvailability = computed(() => availabilityOf(this.overallStatus()));

  protected readonly firstName = computed(() =>
    firstNameOf(this.workspace.currentUser()?.name ?? ''),
  );
  protected readonly unreadMentions = this.notifications.unreadMentionCount;

  protected readonly conversations = computed(() =>
    this.chat.previews().slice(0, RECENT_CONVERSATION_LIMIT),
  );
  private readonly openTasks = computed(() =>
    byDueDate(this.tasks.openTasks()).map((task) =>
      toUpcomingTask(task, this.workspace.user(task.assigneeId)),
    ),
  );
  protected readonly upcoming = computed(() => upcomingTasks(this.openTasks()));
  protected readonly dueToday = computed(() => tasksDueToday(this.openTasks()));
  protected readonly teams = computed(() => toTeamActivity(this.workspace.teams()));
  protected readonly activity = computed(() =>
    toActivity(this.workspace.recentActivity(), (userId) => this.workspace.user(userId)),
  );
  protected readonly stats = computed(() =>
    toStats({
      joinedTeams: this.workspace.joinedTeams(),
      unreadMessages: this.chat.unreadTotal(),
      unreadConversations: this.chat.unreadConversationCount(),
      openTasks: this.openTasks(),
      onlineMembers: this.workspace.onlineUserCount(),
      knownMembers: this.workspace.users().length,
      workspace: this.workspace.currentWorkspace(),
    }),
  );

  protected startConversation(): void {
    this.search.open('people');
  }

  protected newTask(): void {
    this.dialogs.open(TaskDialogComponent, { size: 'lg' });
  }

  protected invitePeople(): void {
    this.dialogs.open(InviteDialogComponent, { size: 'md' });
  }

  protected async upload(fileNames: readonly string[]): Promise<void> {
    for (const fileName of fileNames) {
      await this.files.uploadFile(fileName);
      this.toasts.show(`${fileName} uploaded`, { icon: 'upload' });
    }
  }

  protected reloadWorkspace(): void {
    void this.workspace.reload();
  }

  protected reloadConversations(): void {
    void this.workspace.reload();
    void this.chat.reload();
  }

  protected reloadTasks(): void {
    void this.tasks.reload();
  }
}
