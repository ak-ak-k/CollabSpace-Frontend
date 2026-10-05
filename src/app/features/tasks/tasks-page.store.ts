import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TASK_COLUMNS, TaskStatus } from '../../core/models/task';
import { firstNameOf } from '../../core/models/user';
import { FileState } from '../../core/state/file.state';
import { TaskCommentState } from '../../core/state/task-comment.state';
import { TaskState } from '../../core/state/task.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { formatCount } from '../../shared/pipes/count.pipe';
import { SelectOption } from '../../shared/ui/select/select.component';
import { TaskActions, TEAM_QUERY_PARAM, VIEW_QUERY_PARAM } from './task-actions.service';
import {
  activeFilterCount,
  ALL_TEAMS,
  EMPTY_FILTERS,
  filterChips,
  isFiltered,
  listCaptionOf,
  matchesTask,
  NO_TEAM,
  sortTasks,
  TaskChipRemoval,
  TaskCriteria,
  TaskFilters,
  TaskLayout,
  TaskSort,
  toggled,
  withoutChip,
} from './tasks-filters';
import { assigneeIdsOf, personOf, TaskCardView, taskCardView, TaskPerson } from './tasks-view';

export interface BoardColumn {
  readonly status: TaskStatus;
  readonly label: string;
  readonly cards: readonly TaskCardView[];
}

const NO_TEAM_LABEL = 'No team';
const ALL_TEAMS_LABEL = 'All teams';
const KICKER_SEPARATOR = ' · ';

@Injectable()
export class TasksPageStore {
  private readonly tasks = inject(TaskState);
  private readonly workspace = inject(WorkspaceState);
  private readonly comments = inject(TaskCommentState);
  private readonly files = inject(FileState);
  private readonly actions = inject(TaskActions);

  private readonly queryParams = toSignal(inject(ActivatedRoute).queryParamMap, {
    requireSync: true,
  });

  readonly teamId = computed(() => this.queryParams().get(TEAM_QUERY_PARAM) ?? ALL_TEAMS);
  readonly layout = computed<TaskLayout>(() =>
    this.queryParams().get(VIEW_QUERY_PARAM) === 'list' ? 'list' : 'board',
  );
  readonly query = signal('');
  readonly assigneeIds = signal<readonly string[]>([]);
  readonly filters = signal<TaskFilters>(EMPTY_FILTERS);
  readonly sort = signal<TaskSort>('due');

  readonly status = this.tasks.status;

  private readonly criteria = computed<TaskCriteria>(() => ({
    query: this.query(),
    assigneeIds: this.assigneeIds(),
    teamId: this.teamId(),
    filters: this.filters(),
  }));
  private readonly attachmentCounts = computed(() => {
    const counts = new Map<string, number>();
    this.files
      .files()
      .forEach((file) =>
        file.taskIds.forEach((taskId) => counts.set(taskId, (counts.get(taskId) ?? 0) + 1)),
      );
    return counts;
  });
  private readonly teamNames = computed(
    () => new Map(this.workspace.teams().map((team) => [team.id, team.name])),
  );
  private readonly viewContext = computed(() => {
    const users = this.workspace.usersById();
    const teams = this.teamNames();
    const comments = this.comments.counts();
    const attachments = this.attachmentCounts();
    return {
      user: (userId: string | null) => (userId ? (users.get(userId) ?? null) : null),
      teamName: (teamId: string | null) => (teamId ? (teams.get(teamId) ?? null) : null),
      commentCount: (taskId: string) => comments.get(taskId) ?? 0,
      attachmentCount: (taskId: string) => attachments.get(taskId) ?? 0,
      now: Date.now(),
    };
  });
  private readonly visibleTasks = computed(() => {
    const criteria = this.criteria();
    const now = Date.now();
    return this.tasks.tasks().filter((task) => matchesTask(task, criteria, now));
  });

  readonly visibleCount = computed(() => this.visibleTasks().length);
  readonly totalCount = computed(() => this.tasks.tasks().length);
  readonly countLabel = computed(
    () => `${this.visibleCount()} of ${formatCount(this.totalCount(), 'task')}`,
  );
  readonly filtered = computed(() => isFiltered(this.criteria()));
  readonly filterCount = computed(() => activeFilterCount(this.filters(), this.teamId()));
  readonly filterLabel = computed(() =>
    this.filterCount() ? `Filters · ${this.filterCount()}` : 'Filters',
  );
  readonly chips = computed(() =>
    filterChips(this.criteria(), {
      team: (teamId) => this.teamLabel(teamId),
      assignee: (userId) => firstNameOf(this.workspace.user(userId)?.name ?? 'Someone'),
    }),
  );
  readonly people = computed<readonly TaskPerson[]>(() =>
    assigneeIdsOf(this.tasks.tasks())
      .map((id) => personOf(this.workspace.user(id)))
      .filter((person) => person !== null),
  );
  readonly columns = computed<readonly BoardColumn[]>(() => {
    const context = this.viewContext();
    const visible = this.visibleTasks();
    return TASK_COLUMNS.map((column) => ({
      status: column.status,
      label: column.label,
      cards: visible
        .filter((task) => task.status === column.status)
        .map((task) => taskCardView(task, context)),
    }));
  });
  readonly rows = computed<readonly TaskCardView[]>(() => {
    const context = this.viewContext();
    return sortTasks(this.visibleTasks(), this.sort()).map((task) => taskCardView(task, context));
  });
  readonly listCaption = computed(() => listCaptionOf(this.visibleCount(), this.sort()));
  readonly kicker = computed(() => {
    const name = this.workspace.currentWorkspace()?.name ?? 'Workspace';
    const teamId = this.teamId();
    return teamId === ALL_TEAMS ? name : `${name}${KICKER_SEPARATOR}${this.teamLabel(teamId)}`;
  });
  readonly teamOptions = computed<readonly SelectOption[]>(() => [
    { value: ALL_TEAMS, label: ALL_TEAMS_LABEL },
    ...this.workspace.teams().map((team) => ({ value: team.id, label: team.name })),
    { value: NO_TEAM, label: NO_TEAM_LABEL },
  ]);
  readonly createTeamId = computed(() => {
    const teamId = this.teamId();
    return teamId === ALL_TEAMS || teamId === NO_TEAM ? null : teamId;
  });

  teamLabel(teamId: string): string {
    return teamId === NO_TEAM ? NO_TEAM_LABEL : (this.teamNames().get(teamId) ?? teamId);
  }

  toggleAssignee(userId: string): void {
    this.assigneeIds.update((ids) => toggled(ids, userId));
  }

  removeChip(removal: TaskChipRemoval): void {
    if (removal.kind === 'team') {
      this.actions.showTeam(ALL_TEAMS);
    } else if (removal.kind === 'assignee') {
      this.toggleAssignee(removal.value);
    } else {
      this.filters.update((filters) => withoutChip(filters, removal));
    }
  }

  clearAll(): void {
    this.query.set('');
    this.assigneeIds.set([]);
    this.filters.set(EMPTY_FILTERS);
    if (this.teamId() !== ALL_TEAMS) {
      this.actions.showTeam(ALL_TEAMS);
    }
  }
}
