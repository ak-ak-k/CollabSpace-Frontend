import { MOCK_TASKS } from '../../core/mocks/tasks.mock';
import {
  EMPTY_FILTERS,
  filterChips,
  matchesTask,
  NO_TEAM,
  sortTasks,
  TaskCriteria,
} from './tasks-filters';

const criteria = (changes: Partial<TaskCriteria> = {}): TaskCriteria => ({
  query: '',
  assigneeIds: [],
  teamId: '',
  filters: EMPTY_FILTERS,
  ...changes,
});

const idsMatching = (changes: Partial<TaskCriteria>): string[] =>
  MOCK_TASKS.filter((task) => matchesTask(task, criteria(changes))).map((task) => task.id);

describe('task filters', () => {
  it('searches titles, ids and descriptions', () => {
    expect(idsMatching({ query: 'indexeddb' })).toEqual(['NS-158']);
    expect(idsMatching({ query: 'ns-142' })).toEqual(['NS-142']);
  });

  it('filters by team, status, label and overdue', () => {
    expect(idsMatching({ teamId: NO_TEAM })).toEqual(['NS-161', 'NS-135']);
    expect(idsMatching({ filters: { ...EMPTY_FILTERS, statuses: ['review'] } })).toEqual([
      'NS-139',
      'NS-141',
    ]);
    expect(idsMatching({ filters: { ...EMPTY_FILTERS, labels: ['Research', 'Content'] } })).toEqual(
      ['NS-161', 'NS-135'],
    );
    expect(idsMatching({ filters: { ...EMPTY_FILTERS, due: 'overdue' } })).toEqual(['NS-139']);
  });

  it('sorts by priority, then due date, and keeps done tasks last by due date', () => {
    expect(sortTasks(MOCK_TASKS, 'priority')[0]?.id).toBe('NS-150');
    expect(sortTasks(MOCK_TASKS, 'due').at(-1)?.status).toBe('done');
    expect(sortTasks(MOCK_TASKS, 'due')[0]?.id).toBe('NS-139');
  });

  it('builds removable chips for every active filter', () => {
    const chips = filterChips(
      criteria({
        teamId: 't-design',
        assigneeIds: ['u1'],
        filters: { ...EMPTY_FILTERS, priorities: ['high'], due: 'week' },
      }),
      { team: () => 'Design', assignee: () => 'Rahul' },
    );

    expect(chips.map((chip) => chip.removeLabel)).toEqual([
      'Remove filter Team: Design',
      'Remove filter Priority: High',
      'Remove filter Due this week',
      'Remove filter Assignee: Rahul',
    ]);
  });
});
