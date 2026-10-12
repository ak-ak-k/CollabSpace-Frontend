import { MOCK_TASKS } from '../mocks/tasks.mock';
import { Task, taskRouteOf } from '../models/task';
import {
  createdNote,
  dueDateLabel,
  restoredNote,
  statusNote,
  taskActivityEntry,
  taskChangeNote,
  TaskNoteLookup,
} from './task-activity-note';

const FIRST_NAMES: Readonly<Record<string, string>> = { u1: 'Priya', u12: 'Maya' };
const FULL_NAMES: Readonly<Record<string, string>> = { u1: 'Priya Nair', u12: 'Maya Iyer' };

const lookup: TaskNoteLookup = {
  userName: (userId) => FIRST_NAMES[userId] ?? null,
  userFullName: (userId) => FULL_NAMES[userId] ?? null,
  teamName: (teamId) =>
    teamId === 't-design' ? 'Design' : teamId === 't-frontend' ? 'Frontend' : null,
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

  it('describes status changes, reopening and priority with both values', () => {
    expect(taskChangeNote(composer, { status: 'review' }, lookup)).toEqual({
      verb: 'moved',
      object: 'NS-142 to Review',
      action: 'task.status_changed',
      change: { from: 'In progress', to: 'Review' },
    });
    expect(taskChangeNote(composer, { status: 'done' }, lookup)).toMatchObject({
      verb: 'completed',
      object: 'NS-142',
      action: 'task.completed',
    });
    expect(statusNote({ ...composer, status: 'done' }, 'todo')).toMatchObject({
      verb: 'reopened',
      object: 'NS-142',
      action: 'task.reopened',
      change: { from: 'Done', to: 'Todo' },
    });
    expect(taskChangeNote(composer, { priority: 'low' }, lookup)).toEqual({
      verb: 'changed the priority of',
      object: 'NS-142',
      action: 'task.priority_changed',
      change: { from: 'High', to: 'Low' },
    });
  });

  it('tells reassigning, assigning and unassigning apart with full names', () => {
    expect(taskChangeNote(composer, { assigneeId: 'u12' }, lookup)).toEqual({
      verb: 'reassigned',
      object: 'NS-142 to Maya',
      action: 'task.reassigned',
      change: { from: 'Priya Nair', to: 'Maya Iyer' },
    });
    expect(taskChangeNote(composer, { assigneeId: null }, lookup)).toMatchObject({
      verb: 'unassigned',
      action: 'task.unassigned',
      change: { from: 'Priya Nair', to: 'Unassigned' },
    });
    expect(
      taskChangeNote({ ...composer, assigneeId: null }, { assigneeId: 'u12' }, lookup),
    ).toMatchObject({ verb: 'assigned Maya to', object: 'NS-142', action: 'task.assigned' });
  });

  it('shows the old and new due date, team and title', () => {
    const due = new Date(2026, 9, 5).getTime();
    expect(
      taskChangeNote(
        { ...composer, dueAt: due },
        { dueAt: new Date(2026, 9, 12).getTime() },
        lookup,
      ),
    ).toMatchObject({
      verb: 'changed the due date of',
      action: 'task.due_changed',
      change: { from: '5 Oct', to: '12 Oct' },
    });
    expect(dueDateLabel(null)).toBe('No date');
    expect(taskChangeNote(composer, { teamId: 't-design' }, lookup)).toMatchObject({
      object: 'NS-142 to Design',
      action: 'task.team_changed',
      change: { from: 'Frontend', to: 'Design' },
    });
    expect(taskChangeNote(composer, { teamId: null }, lookup)).toMatchObject({
      object: 'NS-142 to no team',
      change: { from: 'Frontend', to: 'No team' },
    });
    expect(taskChangeNote(composer, { title: 'Composer v2' }, lookup)).toMatchObject({
      verb: 'renamed',
      action: 'task.renamed',
      change: { from: composer.title, to: 'Composer v2' },
    });
  });

  it('ignores changes that keep the same value', () => {
    expect(taskChangeNote(composer, { status: composer.status }, lookup)).toBeNull();
    expect(taskChangeNote(composer, { dueAt: composer.dueAt }, lookup)).toBeNull();
    expect(taskChangeNote(composer, { labels: ['Bug'] }, lookup)).toBeNull();
  });

  it('turns a note into a task event linked to the task and its team', () => {
    expect(taskActivityEntry(composer, createdNote(composer))).toEqual({
      kind: 'task',
      verb: 'created',
      object: `NS-142 · ${composer.title}`,
      route: taskRouteOf('NS-142'),
      category: 'activity',
      entity: { type: 'task', id: 'NS-142' },
      teamId: composer.teamId,
      change: null,
      action: 'task.created',
    });
    expect(restoredNote(composer)).toMatchObject({
      verb: 'restored',
      object: `NS-142 · ${composer.title}`,
      action: 'task.restored',
    });
  });
});
