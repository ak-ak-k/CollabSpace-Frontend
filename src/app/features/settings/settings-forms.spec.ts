import { blankTextError, emailError } from './settings-forms';

describe('settings form rules', () => {
  it('rejects text that is only whitespace', () => {
    expect(blankTextError('   ', 'Enter a name.')).toEqual({
      kind: 'blank',
      message: 'Enter a name.',
    });
  });

  it('leaves empty and real text to the other rules', () => {
    expect(blankTextError('', 'Enter a name.')).toBeUndefined();
    expect(blankTextError(' Aarav ', 'Enter a name.')).toBeUndefined();
  });

  it('checks email addresses', () => {
    expect(emailError('aarav@northstar.io')).toBeUndefined();
    expect(emailError('not-an-email')?.kind).toBe('email');
  });
});
