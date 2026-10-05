import { Subtask, Task } from '../models/task';
import { daysFromToday, MINUTES_PER_DAY, minutesAgo } from './mock-clock';
import { TASK_SEEDS, TaskSeed } from './task-seeds.mock';

export interface SeededTask extends Task {
  readonly attachmentCount: number;
}

type SubtaskSeed = readonly [title: string, done: boolean];

const WORKSPACE_ID = 'w1';
const REPORTER_IDS: readonly string[] = ['u4', 'u0', 'u5'];
const CREATED_DAYS_BEFORE = 12;
const CREATED_SPREAD = 9;
const MINUTES_PER_HOUR = 60;

const TEAM_BY_LABEL: Readonly<Record<string, string>> = {
  Frontend: 't-frontend',
  Backend: 't-platform',
  API: 't-platform',
  Infra: 't-platform',
  DevOps: 't-platform',
  Design: 't-design',
  Mobile: 't-mobile',
  Growth: 't-growth',
  Marketing: 't-growth',
  Support: 't-success',
};

const SUBTASK_SEEDS: Readonly<Record<string, readonly SubtaskSeed[]>> = {
  'NS-142': [
    ['Split input and toolbar', true],
    ['Keyboard handling for suggestions', true],
    ['Fix the Safari mention bug', false],
    ['Add tests', false],
  ],
  'NS-145': [
    ['Long-press to pick up a card', true],
    ['Auto-scroll while dragging', false],
    ['“Move to…” menu fallback', false],
  ],
};

const teamIdOf = (labels: readonly string[]): string | null =>
  labels.map((label) => TEAM_BY_LABEL[label]).find((teamId) => teamId !== undefined) ?? null;

const subtasksOf = (taskId: string): Subtask[] =>
  (SUBTASK_SEEDS[taskId] ?? []).map(([title, done], index) => ({
    id: `${taskId}-s${index}`,
    title,
    done,
  }));

export const taskReporterOf = (index: number): string => REPORTER_IDS[index % REPORTER_IDS.length];

export const taskCreatedAtOf = (index: number): number =>
  minutesAgo(MINUTES_PER_DAY * (CREATED_DAYS_BEFORE - (index % CREATED_SPREAD)));

const taskFromSeed = (taskSeed: TaskSeed, index: number): SeededTask => ({
  workspaceId: WORKSPACE_ID,
  id: taskSeed.id,
  title: taskSeed.title,
  description: taskSeed.description,
  status: taskSeed.status,
  priority: taskSeed.priority,
  assigneeId: taskSeed.assigneeId,
  dueAt: daysFromToday(taskSeed.dueInDays),
  labels: taskSeed.labels,
  teamId: teamIdOf(taskSeed.labels),
  subtasks: subtasksOf(taskSeed.id),
  reporterId: taskReporterOf(index),
  createdAt: taskCreatedAtOf(index),
  updatedAt: minutesAgo(MINUTES_PER_HOUR * (index + 1)),
  pending: false,
  attachmentCount: taskSeed.attachmentCount,
});

export const MOCK_TASKS: readonly SeededTask[] = TASK_SEEDS.map(taskFromSeed);
