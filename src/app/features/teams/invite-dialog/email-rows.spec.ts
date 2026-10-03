import { checkEmailRows, inviteBannerOf, summarizeRows } from './email-checks';
import { pastedRowEdit, typedRowEdit } from './email-rows';

describe('invite email rows', () => {
  it('splits a pasted list into rows and adds an empty row to keep typing', () => {
    const edit = pastedRowEdit([{ id: 1, value: '' }], 1, 'mailto:a@x.io, b@x.io;c@x.io');

    expect(edit?.rows.map((row) => row.value)).toEqual(['a@x.io', 'b@x.io', 'c@x.io', '']);
    expect(edit?.focusId).toBe(4);
  });

  it('starts a new row when a separator is typed', () => {
    const edit = typedRowEdit([{ id: 1, value: 'a@x.io' }], 1, 'a@x.io,');

    expect(edit.rows).toEqual([
      { id: 1, value: 'a@x.io' },
      { id: 2, value: '' },
    ]);
  });

  it('classifies invalid, duplicate, member, blocked and pending addresses', () => {
    const rows = ['bad@', 'a@x.io', 'A@x.io', 'me@x.io', 'b@other.com', 'p@x.io'].map(
      (value, index) => ({ id: index + 1, value }),
    );
    const checked = checkEmailRows(rows, {
      memberEmails: new Set(['me@x.io']),
      allowedDomains: ['x.io'],
      invitedAt: (email) => (email === 'p@x.io' ? 1 : null),
    });

    expect(checked.map((row) => row.kind)).toEqual([
      'invalid',
      'ready',
      'duplicate',
      'member',
      'blocked',
      'pending',
    ]);
  });

  it('explains why nothing can be sent', () => {
    const onlyMember = checkEmailRows([{ id: 1, value: 'me@x.io' }], {
      memberEmails: new Set(['me@x.io']),
      allowedDomains: [],
      invitedAt: () => null,
    });

    expect(inviteBannerOf(summarizeRows(onlyMember), 'Northstar')).toBe(
      'That person is already a member of Northstar.',
    );
  });
});
