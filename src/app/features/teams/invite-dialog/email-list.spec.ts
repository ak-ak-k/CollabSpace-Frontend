import { emailListError, parseEmailList } from './email-list';

describe('email list', () => {
  it('splits on commas, semicolons and spaces', () => {
    expect(parseEmailList('a@x.io, b@x.io;c@x.io  d@x.io')).toEqual([
      'a@x.io',
      'b@x.io',
      'c@x.io',
      'd@x.io',
    ]);
  });

  it('requires at least one address', () => {
    expect(emailListError('  ')?.message).toBe('Enter at least one email address.');
  });

  it('names the first address that is not an email', () => {
    expect(emailListError('rahul@northstar.io, priya@')?.message).toBe(
      'Check priya@ — it doesn’t look like an email.',
    );
  });

  it('accepts a valid list', () => {
    expect(emailListError('rahul@northstar.io priya@northstar.io')).toBeUndefined();
  });
});
