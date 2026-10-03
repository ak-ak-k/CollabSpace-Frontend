import {
  resolveWorkspaceSettingsSection,
  workspaceSettingsRedirectOf,
} from './workspace-settings-sections';

describe('workspace settings sections', () => {
  it('falls back to General on tablet and desktop but shows the list on mobile', () => {
    expect(resolveWorkspaceSettingsSection(undefined, false)?.id).toBe('general');
    expect(resolveWorkspaceSettingsSection(undefined, true)).toBeNull();
    expect(resolveWorkspaceSettingsSection('danger', true)?.id).toBe('danger');
  });

  it('redirects missing or unknown sections', () => {
    expect(workspaceSettingsRedirectOf(undefined, false)).toBe('/workspace/settings/general');
    expect(workspaceSettingsRedirectOf('nope', true)).toBe('/workspace/settings');
    expect(workspaceSettingsRedirectOf(undefined, true)).toBeNull();
    expect(workspaceSettingsRedirectOf('roles', false)).toBeNull();
  });
});
