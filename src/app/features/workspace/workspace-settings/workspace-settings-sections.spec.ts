import { Permission } from '../../../core/models/permission';
import {
  canOpenWorkspaceSettings,
  resolveWorkspaceSettingsSection,
  visibleWorkspaceSettingsSections,
  workspaceSettingsRedirectOf,
} from './workspace-settings-sections';

const memberCan = (permission: Permission): boolean => permission !== 'workspace.manage';
const ownerCan = (): boolean => true;
const adminWithoutAuditCan = (permission: Permission): boolean => permission !== 'audit.view';

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

  it('hides security, integrations and the danger zone from non-managers', () => {
    expect(visibleWorkspaceSettingsSections(memberCan).map((section) => section.id)).toEqual([
      'general',
      'members',
      'roles',
      'notifications',
      'appearance',
    ]);
    expect(visibleWorkspaceSettingsSections(ownerCan)).toHaveLength(9);
  });

  it('shows the audit log before the danger zone only to managers who can view it', () => {
    const ownerSections = visibleWorkspaceSettingsSections(ownerCan).map((section) => section.id);

    expect(ownerSections.slice(-2)).toEqual(['audit', 'danger']);
    expect(
      visibleWorkspaceSettingsSections(adminWithoutAuditCan).map((section) => section.id),
    ).not.toContain('audit');
    expect(canOpenWorkspaceSettings('audit', false, ownerCan)).toBe(true);
    expect(canOpenWorkspaceSettings('audit', false, adminWithoutAuditCan)).toBe(false);
    expect(canOpenWorkspaceSettings('audit', false, memberCan)).toBe(false);
  });

  it('keeps guests out of settings and non-managers out of manager sections', () => {
    expect(canOpenWorkspaceSettings('general', true, ownerCan)).toBe(false);
    expect(canOpenWorkspaceSettings('general', false, memberCan)).toBe(true);
    expect(canOpenWorkspaceSettings('security', false, memberCan)).toBe(false);
    expect(canOpenWorkspaceSettings(null, false, memberCan)).toBe(true);
  });
});
