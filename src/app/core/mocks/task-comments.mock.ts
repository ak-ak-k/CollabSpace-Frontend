import { TaskComment } from '../models/task';
import { MINUTES_PER_DAY, minutesAgo } from './mock-clock';
import { TASK_SEEDS, TaskSeed } from './task-seeds.mock';

const COMMENT_POOL: readonly string[] = [
  'Picked this up — first pass should be up for review tomorrow.',
  'Left notes on the edge cases in the PR.',
  'Can we split the API change into its own task?',
  'Looks good from design. One spacing nit on mobile.',
  '@Aarav does this need to ship in 2.4?',
];

const FALLBACK_COMMENTER_IDS: readonly string[] = ['u4', 'u7', 'u2'];
const MAX_SEEDED_COMMENTS = 3;
const MINUTES_BETWEEN_COMMENTS = 40;

const commentersOf = (taskSeed: TaskSeed): string[] =>
  [...new Set([taskSeed.assigneeId, ...FALLBACK_COMMENTER_IDS])].filter(
    (id): id is string => id !== null,
  );

const commentsOf = (taskSeed: TaskSeed, taskIndex: number): TaskComment[] => {
  const count = Math.min(taskSeed.commentCount, MAX_SEEDED_COMMENTS);
  const commenters = commentersOf(taskSeed);
  return Array.from({ length: count }, (_, index) => ({
    id: `${taskSeed.id}-c${index}`,
    taskId: taskSeed.id,
    authorId: commenters[index % commenters.length],
    text: COMMENT_POOL[(taskIndex + index) % COMMENT_POOL.length],
    createdAt: minutesAgo(MINUTES_PER_DAY * (count - index) + MINUTES_BETWEEN_COMMENTS * index),
    edited: false,
  }));
};

export const MOCK_TASK_COMMENTS: readonly TaskComment[] = TASK_SEEDS.flatMap(commentsOf);
