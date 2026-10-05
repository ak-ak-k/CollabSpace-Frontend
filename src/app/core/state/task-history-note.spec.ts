import { MOCK_TASKS } from '../mocks/tasks.mock';
import { Task } from '../models/task';
import { taskChangeNote, TaskNoteLookup } from './task-history-note';

const lookup: TaskNoteLookup = {
  userName: (userId) => (userId === 'u12' ? 'Maya' : null),
  teamName: (teamId) => (teamId === 't-design' ? 'Design' : null),
};

const task = (id: string): Task => {
  const found = MOCK_TASKS.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing mock task ${id}`);
  }
  return found;
};

describe('taskChangeNote', () => {
  const composer = task('NS-142');

  it('describes status and priority changes with both values', () => {
    expect(taskChangeNote(composer, { status: 'review' }, lookup)).toBe(
      'changed status: In progress → Review',
    );
    expect(taskChangeNote(composer, { priority: 'low' }, lookup)).toBe(
      'changed priority: High → Low',
    );
  });

  it('describes assignee and team changes', () => {
    expect(taskChangeNote(composer, { assigneeId: 'u12' }, lookup)).toBe('assigned Maya');
    expect(taskChangeNote(composer, { assigneeId: null }, lookup)).toBe('removed the assignee');
    expect(taskChangeNote(composer, { teamId: 't-design' }, lookup)).toBe('moved it to Design');
    expect(taskChangeNote(composer, { teamId: null }, lookup)).toBe('removed the team');
  });

  it('describes due date and title changes and ignores no-ops', () => {
    expect(taskChangeNote(composer, { dueAt: composer.dueAt + 1 }, lookup)).toBe(
      'changed the due date',
    );
    expect(taskChangeNote(composer, { title: 'Composer v2' }, lookup)).toBe('renamed the task');
    expect(taskChangeNote(composer, { status: composer.status }, lookup)).toBeNull();
    expect(taskChangeNote(composer, { labels: ['Bug'] }, lookup)).toBeNull();
  });
});
