import { cleanSlugInput, slugify, workspaceNameError, workspaceSlugError } from './workspace-rules';

describe('workspace rules', () => {
  it('turns a name into a workspace address', () => {
    expect(slugify('Acme Technologies, Inc.')).toBe('acme-technologies-inc');
    expect(slugify('Café Créme')).toBe('cafe-creme');
    expect(cleanSlugInput('My  Team!')).toBe('my-team-');
  });

  it('explains what is wrong with a name or address', () => {
    const taken = (slug: string) => slug === 'northstar-labs';

    expect(workspaceNameError(' A ')).toBe('Give the workspace a name.');
    expect(workspaceSlugError('', taken)).toBe('Choose an address for the workspace.');
    expect(workspaceSlugError('-bad', taken)).toContain('Use 3–40 lowercase letters');
    expect(workspaceSlugError('admin', taken)).toBe(
      'admin.collabspace.app is taken — try another.',
    );
    expect(workspaceSlugError('northstar-labs', taken)).toContain('is taken');
    expect(workspaceSlugError('acme', taken)).toBe('');
  });
});
