import { DEFAULT_ROLE_PERMISSIONS } from '../models/permission';
import { WorkspaceRole } from '../models/user';
import { allows, PermissionSubject } from './permission-check';

const subject = (role: WorkspaceRole): PermissionSubject => ({
  userId: 'me',
  role,
  rolePermissions: DEFAULT_ROLE_PERMISSIONS,
});

const someoneElses = { task: { reporterId: 'u1', assigneeId: 'u2' } };
const mine = { task: { reporterId: 'me', assigneeId: null } };

describe('allows', () => {
  it('gives owners everything and nobody else workspace deletion', () => {
    expect(allows(subject('owner'), 'workspace.delete')).toBe(true);
    expect(allows(subject('admin'), 'workspace.delete')).toBe(false);
    expect(allows(subject('admin'), 'workspace.manage')).toBe(true);
    expect(allows(subject('member'), 'workspace.manage')).toBe(false);
    expect(allows(subject('guest'), 'tasks.create')).toBe(false);
  });

  it('lets people delete their own tasks and admins delete any task, never guests', () => {
    expect(allows(subject('member'), 'tasks.delete', mine)).toBe(true);
    expect(allows(subject('member'), 'tasks.delete', someoneElses)).toBe(false);
    expect(allows(subject('admin'), 'tasks.delete', someoneElses)).toBe(true);
    expect(allows(subject('guest'), 'tasks.delete', mine)).toBe(false);
  });

  it('lets file owners and admins manage files', () => {
    expect(allows(subject('member'), 'files.manage', { file: { ownerId: 'me' } })).toBe(true);
    expect(allows(subject('member'), 'files.manage', { file: { ownerId: 'u1' } })).toBe(false);
    expect(allows(subject('admin'), 'files.manage', { file: { ownerId: 'u1' } })).toBe(true);
  });

  it('lets team owners and team admins manage their own team', () => {
    const team = { ownerId: 'u1', adminIds: ['me'] };
    expect(allows(subject('guest'), 'teams.manage', { team })).toBe(true);
    expect(allows(subject('member'), 'teams.manage', { team: { ...team, adminIds: [] } })).toBe(
      false,
    );
    expect(allows(subject('admin'), 'teams.manage', { team: { ...team, adminIds: [] } })).toBe(
      true,
    );
  });
});
