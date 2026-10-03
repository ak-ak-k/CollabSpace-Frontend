import { MOCK_FILES } from '../../core/mocks/files.mock';
import { MOCK_USERS } from '../../core/mocks/users.mock';
import { nextSort } from './files-options';
import { filterRows, sortRows, toFileRow } from './files-view';

const usersById = new Map(MOCK_USERS.map((user) => [user.id, user]));
const rows = MOCK_FILES.map((file) => toFileRow(file, usersById, 'u0'));

describe('files view', () => {
  it('filters by folder, type and owner name', () => {
    expect(filterRows(rows, { folder: 'mine', query: '', type: 'all' })).toHaveLength(3);
    expect(filterRows(rows, { folder: 'recent', query: '', type: 'pdf' })).toHaveLength(5);
    const ownName = usersById.get('u0')?.name.toLowerCase() ?? '';
    expect(filterRows(rows, { folder: 'recent', query: ownName, type: 'all' })).toHaveLength(3);
  });

  it('sorts by size and flips the direction of the active column', () => {
    const largestFirst = sortRows(rows, { key: 'size', direction: 'desc' });
    expect(largestFirst[0]?.name).toBe('Product demo.mp4');
    expect(nextSort({ key: 'size', direction: 'desc' }, 'size').direction).toBe('asc');
    expect(nextSort({ key: 'size', direction: 'desc' }, 'name').direction).toBe('asc');
  });
});
