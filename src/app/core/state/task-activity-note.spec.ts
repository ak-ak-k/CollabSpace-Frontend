import { MOCK_TASKS } from '../mocks/tasks.mock';
import { Task } from '../models/task';
import {
  createdNote,
  taskActivityEntry,
  taskChangeNote,
  TaskNoteLookup,
} from './task-activity-note';

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

describe('task activity notes', () => {
  const composer = task('NS-142');

  it('describes status and priority changes with both values', () => {
    expect(taskChangeNote(composer, { status: 'review' }, lookup)).toEqual({
      verb: 'moved',
      object: 'NS-142 to Review',
      change: { from: 'In progress', to: 'Review' },
    });
    expect(taskChangeNote(composer, { status: 'done' }, lookup)).toMatchObject({
      verb: 'completed',
      object: 'NS-142',
    });
    expect(taskChangeNote(composer, { priority: 'low' }, lookup)).toEqual({
      verb: 'changed the priority of',
      object: 'NS-142',
      change: { from: 'High', to: 'Low' },
    });
  });

  it('describes assignee and team changes', () => {
    expect(taskChangeNote(composer, { assigneeId: 'u12' }, lookup)?.verb).toBe('assigned Maya to');
    expect(taskChangeNote(composer, { assigneeId: null }, lookup)?.verb).toBe('unassigned');
    expect(taskChangeNote(composer, { teamId: 't-design' }, lookup)?.object).toBe(
      'NS-142 to Design',
    );
    expect(taskChangeNote(composer, { teamId: null }, lookup)?.object).toBe('NS-142 to no team');
  });

  it('describes due date and title changes and ignores no-ops', () => {
    expect(taskChangeNote(composer, { dueAt: composer.dueAt + 1 }, lookup)?.verb).toBe(
      'changed the due date of',
    );
    expect(taskChangeNote(composer, { title: 'Composer v2' }, lookup)?.verb).toBe('renamed');
    expect(taskChangeNote(composer, { status: composer.status }, lookup)).toBeNull();
    expect(taskChangeNote(composer, { labels: ['Bug'] }, lookup)).toBeNull();
  });

  it('turns a note into a task event linked to the task and its team', () => {
    expect(taskActivityEntry(composer, createdNote(composer))).toEqual({
      kind: 'task',
      verb: 'created',
      object: `NS-142 · ${composer.title}`,
      route: '/tasks?task=NS-142',
      category: 'activity',
      entity: { type: 'task', id: 'NS-142' },
      teamId: composer.teamId,
      change: null,
    });
  });
});
