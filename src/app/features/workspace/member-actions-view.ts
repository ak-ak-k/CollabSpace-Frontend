import { WorkspaceRole } from '../../core/models/user';
import { WorkspaceAccess } from '../../core/models/workspace';
import { IconName } from '../../shared/ui/icon/icon-registry';
import { MemberRow } from './members-view';

export type MemberActionKind = 'profile' | 'edit-profile' | 'message' | 'role' | 'remove';

export interface MemberMenuItem {
  readonly kind: MemberActionKind;
  readonly label: string;
  readonly icon: IconName;
  readonly danger: boolean;
}

export const canChangeMember = (
  access: WorkspaceAccess,
  role: WorkspaceRole,
  removable: boolean,
): boolean => access.canManageMembers && removable && !(role === 'owner' && !access.isOwner);

export const memberMenuItems = (
  member: Pick<MemberRow, 'isMe' | 'firstName'>,
  canChange: boolean,
): readonly MemberMenuItem[] => {
  const contact: MemberMenuItem = member.isMe
    ? { kind: 'edit-profile', label: 'Edit your profile', icon: 'pencil', danger: false }
    : {
        kind: 'message',
        label: `Message ${member.firstName}`,
        icon: 'message-square',
        danger: false,
      };
  const management: readonly MemberMenuItem[] = canChange
    ? [
        { kind: 'role', label: 'Change role…', icon: 'user-cog', danger: false },
        { kind: 'remove', label: 'Remove from workspace', icon: 'user-minus', danger: true },
      ]
    : [];
  return [
    { kind: 'profile', label: 'View profile', icon: 'user', danger: false },
    contact,
    ...management,
  ];
};
