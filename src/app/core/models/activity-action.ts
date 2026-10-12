export type TaskActivityAction =
  | 'task.created'
  | 'task.updated'
  | 'task.status_changed'
  | 'task.completed'
  | 'task.reopened'
  | 'task.priority_changed'
  | 'task.assigned'
  | 'task.reassigned'
  | 'task.unassigned'
  | 'task.due_changed'
  | 'task.team_changed'
  | 'task.renamed'
  | 'task.commented'
  | 'task.deleted'
  | 'task.restored';

export type FileActivityAction =
  | 'file.uploaded'
  | 'file.attached'
  | 'file.updated'
  | 'file.renamed'
  | 'file.deleted'
  | 'file.restored';

export type TeamActivityAction =
  | 'team.created'
  | 'team.updated'
  | 'team.renamed'
  | 'team.privacy_changed'
  | 'team.archived'
  | 'team.unarchived'
  | 'team.role_changed'
  | 'team.member_added'
  | 'team.member_removed'
  | 'team.member_joined'
  | 'team.member_left';

export type ChannelActivityAction =
  | 'channel.created'
  | 'channel.updated'
  | 'channel.renamed'
  | 'channel.privacy_changed'
  | 'channel.archived'
  | 'channel.unarchived';

export type MemberActivityAction =
  | 'member.joined'
  | 'member.left'
  | 'member.role_changed'
  | 'member.removed'
  | 'member.restored'
  | 'invite.sent'
  | 'invite.resent'
  | 'invite.revoked'
  | 'invite.restored'
  | 'role.permission_changed';

export type WorkspaceActivityAction =
  | 'workspace.created'
  | 'workspace.updated'
  | 'workspace.renamed'
  | 'workspace.logo_changed'
  | 'workspace.logo_removed'
  | 'workspace.ownership_transferred'
  | 'workspace.archived'
  | 'workspace.unarchived'
  | 'workspace.deletion_scheduled'
  | 'workspace.deletion_cancelled'
  | 'workspace.setting_changed'
  | 'security.setting_changed'
  | 'security.sessions_revoked'
  | 'integration.connected'
  | 'integration.disconnected'
  | 'integration.event'
  | 'message.pinned';

export type ActivityAction =
  | TaskActivityAction
  | FileActivityAction
  | TeamActivityAction
  | ChannelActivityAction
  | MemberActivityAction
  | WorkspaceActivityAction;
