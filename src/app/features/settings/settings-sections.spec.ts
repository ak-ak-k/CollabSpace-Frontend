import {
  MOVED_SETTINGS_REDIRECTS,
  resolveSettingsSection,
  SETTINGS_GROUP_VIEWS,
  settingsRedirectOf,
} from './settings-sections';

describe('settings sections', () => {
  it('falls back to Account on tablet and desktop but shows the list on mobile', () => {
    expect(resolveSettingsSection('unknown', false)?.id).toBe('account');
    expect(resolveSettingsSection(undefined, true)).toBeNull();
    expect(resolveSettingsSection('privacy', true)?.id).toBe('privacy');
  });

  it('redirects missing or unknown sections to the right URL', () => {
    expect(settingsRedirectOf(undefined, false)).toBe('/settings/account');
    expect(settingsRedirectOf('nope', true)).toBe('/settings');
    expect(settingsRedirectOf(undefined, true)).toBeNull();
    expect(settingsRedirectOf('privacy', false)).toBeNull();
  });

  it('keeps one Workspace item that opens the workspace settings', () => {
    const workspaceGroup = SETTINGS_GROUP_VIEWS.find((group) => group.label === 'Workspace');

    expect(workspaceGroup?.items.map((item) => item.link)).toEqual(['/workspace/settings/general']);
    expect(MOVED_SETTINGS_REDIRECTS['members']).toBe('/workspace/members');
    expect(resolveSettingsSection('roles', false)?.id).toBe('account');
  });
});
