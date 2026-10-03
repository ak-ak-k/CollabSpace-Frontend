import { Task, TaskComment } from '../models/task';
import { minutesAgo } from './mock-clock';

const COMMENT_POOL: readonly string[] = [
  'Picked this up — first pass should be up for review tomorrow.',
  'Left notes on the edge cases in the PR.',
  'Can we split the API change into its own task?',
  'Looks good from design. One spacing nit on mobile.',
];

const FALLBACK_COMMENTER_IDS: readonly string[] = ['u4', 'u7'];
const MAX_SEEDED_COMMENTS = 2;
const COMMENT_AGES_IN_MINUTES: readonly number[] = [24 * 60, 5 * 60];

const taskNumberOf = (task: Task): number => Number.parseInt(task.id.split('-')[1] ?? '0', 10) || 0;

export const seedTaskComments = (task: Task): TaskComment[] => {
  const commenters = [...new Set([task.assigneeId, ...FALLBACK_COMMENTER_IDS])].filter(
    (id): id is string => id !== null,
  );
  const count = Math.min(task.commentCount, MAX_SEEDED_COMMENTS);
  return Array.from({ length: count }, (_, index) => ({
    id: `${task.id}-seed-${index}`,
    taskId: task.id,
    authorId: commenters[index % commenters.length],
    text: COMMENT_POOL[(taskNumberOf(task) + index) % COMMENT_POOL.length],
    createdAt: minutesAgo(COMMENT_AGES_IN_MINUTES[index]),
  }));
};
