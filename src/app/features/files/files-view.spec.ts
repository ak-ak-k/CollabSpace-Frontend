import { MOCK_FILES } from '../../core/mocks/files.mock';
import { MOCK_USERS } from '../../core/mocks/users.mock';
import { FileSourceLookup } from '../../core/models/file-source';
import { fileNameError, splitFileName } from './file-name';
import { filterChips, filterRows, FileQuery, NO_FILE_FILTERS, sortRows } from './files-filters';
import { fileMenuItems, toFileRow } from './files-view';

const lookup: FileSourceLookup = {
  conversation: () => null,
  userName: () => 'Rahul Mehta',
  teamName: (teamId) => (teamId === 't-design' ? 'Design' : null),
  taskTitle: () => null,
  hasMessage: () => false,
};
const rows = MOCK_FILES.map((file) =>
  toFileRow(file, {
    usersById: new Map(MOCK_USERS.map((user) => [user.id, user])),
    currentUserId: 'u0',
    canManage: (file) => file.ownerId === 'u0',
    lookup,
    now: Date.now(),
  }),
);
const query = (changes: Partial<FileQuery>): FileQuery => ({
  folder: 'recent',
  search: '',
  filters: NO_FILE_FILTERS,
  scope: { teamId: '', conversationId: '', teamChannelIds: new Set() },
  now: Date.now(),
  ...changes,
});

describe('files view', () => {
  it('filters by folder, type, source and search text', () => {
    expect(filterRows(rows, query({ folder: 'mine' }))).toHaveLength(3);
    const pdfs = filterRows(rows, query({ filters: { ...NO_FILE_FILTERS, types: ['pdf'] } }));
    expect(pdfs.every((row) => row.type === 'pdf')).toBe(true);
    expect(filterRows(rows, query({ search: 'uploaded to design' }))[0]?.name).toBe(
      'Onboarding v3.fig',
    );
    const uploads = filterRows(rows, query({ filters: { ...NO_FILE_FILTERS, source: 'upload' } }));
    expect(uploads.every((row) => row.source.kind === 'upload')).toBe(true);
  });

  it('sorts by size and builds removable chips', () => {
    expect(sortRows(rows, { key: 'size', direction: 'desc' })[0]?.name).toBe('Product demo.mp4');
    const chips = filterChips(
      { ...NO_FILE_FILTERS, types: ['pdf'], modified: '7' },
      { teamId: 't-design', conversationId: '', teamChannelIds: new Set() },
      { teamName: 'Design', conversationTitle: '', ownerName: '' },
    );
    expect(chips.map((chip) => chip.label)).toEqual([
      'Team: Design',
      'Type: PDF',
      'Modified: last 7 days',
    ]);
  });

  it('offers rename and delete only to people who can manage the file', () => {
    const mine = rows.find((row) => row.mine);
    const theirs = rows.find((row) => !row.mine);
    expect(mine && fileMenuItems(mine).map((item) => item.kind)).toContain('remove');
    expect(theirs && fileMenuItems(theirs).map((item) => item.kind)).not.toContain('rename');
  });

  it('splits and validates file names', () => {
    expect(splitFileName('Design QA — 2.4.pdf')).toEqual({
      base: 'Design QA — 2.4',
      extension: '.pdf',
    });
    expect(fileNameError('  ')).toBe('Enter a file name.');
    expect(fileNameError('bad:name')).toContain('can’t contain');
    expect(fileNameError('Roadmap')).toBe('');
  });
});
