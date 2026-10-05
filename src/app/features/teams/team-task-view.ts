import { Task, TASK_STATUS_LABELS } from '../../core/models/task';
import { firstNameOf, User } from '../../core/models/user';

export interface TeamTaskView {
  readonly id: string;
  readonly title: string;
  readonly statusLabel: string;
  readonly assigneeLabel: string;
}

const UNASSIGNED = 'Unassigned';

export const teamTaskView = (task: Task, assignee: User | null): TeamTaskView => ({
  id: task.id,
  title: task.title,
  statusLabel: TASK_STATUS_LABELS[task.status],
  assigneeLabel: assignee ? firstNameOf(assignee.name) : UNASSIGNED,
});
