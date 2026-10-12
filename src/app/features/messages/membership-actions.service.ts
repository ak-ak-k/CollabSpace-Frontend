import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { ChannelConversation } from '../../core/models/conversation';
import { firstNameOf } from '../../core/models/user';
import { ConnectionGuard } from '../../core/services/connection-guard.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { ChatMembershipState } from '../../core/state/chat-membership.state';
import { ChatState } from '../../core/state/chat.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { TeamAdminActions } from '../teams/team-admin-actions.service';
import { AddPeopleDialog } from './add-people-dialog/add-people-dialog.service';
import { EditChannelDialogComponent } from './edit-channel-dialog/edit-channel-dialog.component';

const MESSAGES_ROUTE = '/messages';

@Service()
export class MembershipActions {
  private readonly chat = inject(ChatState);
  private readonly membership = inject(ChatMembershipState);
  private readonly workspace = inject(WorkspaceState);
  private readonly dialogs = inject(DialogService);
  private readonly addPeopleDialog = inject(AddPeopleDialog);
  private readonly teamAdmin = inject(TeamAdminActions);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);
  private readonly connection = inject(ConnectionGuard);

  async leaveGroup(conversationId: string): Promise<void> {
    if (!this.connection.allows('leaveGroup')) {
      return;
    }
    const title = this.titleOf(conversationId);
    const confirmed = await this.dialogs.confirm({
      title: `Leave ${title}?`,
      body: 'You’ll stop getting messages from this group. Anyone still in it can add you back.',
      confirmLabel: 'Leave group',
      icon: 'log-out',
      canConfirm: this.connection.recheck('leaveGroup'),
    });
    if (!confirmed) {
      return;
    }
    this.membership.leaveGroup(conversationId);
    await this.router.navigateByUrl(MESSAGES_ROUTE);
    this.toasts.show(`You left ${title}`, {
      icon: 'log-out',
      actionLabel: 'Undo',
      onAction: () => this.membership.rejoinGroup(conversationId),
    });
  }

  async leaveChannel(conversationId: string): Promise<void> {
    const channel = this.channelOf(conversationId);
    if (!channel || !this.connection.allows('leaveChannel')) {
      return;
    }
    const confirmed = await this.dialogs.confirm({
      title: `Leave #${channel.name}?`,
      body: 'You’ll stop getting messages from this channel. You can rejoin any time.',
      confirmLabel: 'Leave',
      icon: 'log-out',
      canConfirm: this.connection.recheck('leaveChannel'),
    });
    if (!confirmed) {
      return;
    }
    this.membership.leaveChannel(conversationId);
    await this.router.navigate(['/teams', channel.teamId]);
    this.toasts.show(`You left #${channel.name}`, {
      icon: 'log-out',
      actionLabel: 'Undo',
      onAction: () => this.membership.rejoinChannel(conversationId),
    });
  }

  rejoinChannel(conversationId: string): void {
    if (!this.connection.allows('rejoinChannel')) {
      return;
    }
    this.membership.rejoinChannel(conversationId);
    this.toasts.show(`Joined ${this.titleOf(conversationId)}`, { icon: 'hash' });
  }

  async archiveChannel(conversationId: string): Promise<void> {
    const channel = this.channelOf(conversationId);
    if (!channel || !this.connection.allows('archiveChannel')) {
      return;
    }
    const confirmed = await this.dialogs.confirm({
      title: `Archive #${channel.name}?`,
      body: 'Nobody can post in it any more. Its messages and files stay searchable.',
      confirmLabel: 'Archive channel',
      icon: 'archive',
      tone: 'neutral',
      canConfirm: this.connection.recheck('archiveChannel'),
    });
    if (!confirmed) {
      return;
    }
    this.membership.archiveChannel(conversationId);
    await this.router.navigate(['/teams', channel.teamId, 'channels']);
    this.toasts.show(`#${channel.name} archived`, {
      icon: 'archive',
      actionLabel: 'Undo',
      onAction: () => this.membership.unarchiveChannel(conversationId),
    });
  }

  unarchiveChannel(conversationId: string): void {
    if (!this.connection.allows('unarchiveChannel')) {
      return;
    }
    this.membership.unarchiveChannel(conversationId);
    this.toasts.show(`${this.titleOf(conversationId)} is active again`, {
      icon: 'archive-restore',
    });
  }

  editChannel(conversationId: string): void {
    const channel = this.workspace.channels().find((candidate) => candidate.id === conversationId);
    if (channel && this.connection.allows('editChannel')) {
      this.dialogs.open(EditChannelDialogComponent, { data: { channel }, size: 'md' });
    }
  }

  async renameGroup(conversationId: string, name: string): Promise<void> {
    if (!this.connection.allows('renameGroup')) {
      return;
    }
    await this.membership.renameGroup(conversationId, name);
    this.toasts.show(`Group renamed to ${name}`, { icon: 'pencil' });
  }

  async addPeople(conversationId: string): Promise<void> {
    const conversation = this.chat.conversation(conversationId);
    if (!conversation || conversation.type === 'dm') {
      return;
    }
    const channel = this.workspace.channels().find((candidate) => candidate.id === conversationId);
    if (conversation.type === 'channel' && channel && !channel.isPrivate) {
      return this.teamAdmin.addMembers(conversation.teamId);
    }
    if (!this.connection.allows('addPeople')) {
      return;
    }
    const title = this.titleOf(conversationId);
    const userIds = await this.addPeopleDialog.open({
      title: `Add people to ${title}`,
      description: 'They’ll see the conversation history from now on.',
      excludeIds: conversation.memberIds,
      confirmLabel: conversation.type === 'channel' ? 'Add to channel' : 'Add to group',
    });
    if (userIds.length === 0) {
      return;
    }
    await this.membership.addToGroup(conversationId, userIds);
    this.toasts.show(`${this.peopleLabel(userIds)} added to ${title}`, { icon: 'user-plus' });
  }

  async removeMember(conversationId: string, userId: string): Promise<void> {
    if (!this.connection.allows('removeFromGroup')) {
      return;
    }
    const name = this.workspace.user(userId)?.name ?? 'Someone';
    await this.membership.removeFromGroup(conversationId, userId);
    this.toasts.show(`${name} removed from ${this.titleOf(conversationId)}`, {
      icon: 'user-minus',
      actionLabel: 'Undo',
      onAction: () => void this.membership.addToGroup(conversationId, [userId]),
    });
  }

  private titleOf(conversationId: string): string {
    return this.chat.preview(conversationId)?.title ?? 'this conversation';
  }

  private channelOf(conversationId: string): ChannelConversation | null {
    const conversation = this.chat.conversation(conversationId);
    return conversation?.type === 'channel' ? conversation : null;
  }

  private peopleLabel(userIds: readonly string[]): string {
    if (userIds.length > 1) {
      return `${userIds.length} people`;
    }
    return firstNameOf(this.workspace.user(userIds[0])?.name ?? 'Someone');
  }
}
