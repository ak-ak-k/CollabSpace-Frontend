import { inject, Service, WritableSignal } from '@angular/core';
import { ChatData } from '../data/chat.data';
import { MemberConversation } from '../models/conversation';
import { ActivityLogState } from './activity-log.state';
import { setIn } from './chat-mutations';
import { ChatState } from './chat.state';
import { channelArchiveEntry } from './team-activity';

@Service()
export class ChatMembershipState {
  private readonly chat = inject(ChatState);
  private readonly data = inject(ChatData);
  private readonly activity = inject(ActivityLogState);

  leaveChannel(conversationId: string): void {
    this.setLeft(conversationId, true);
  }

  rejoinChannel(conversationId: string): void {
    this.setLeft(conversationId, false);
  }

  leaveGroup(conversationId: string): void {
    this.setLeft(conversationId, true);
  }

  rejoinGroup(conversationId: string): void {
    this.setLeft(conversationId, false);
  }

  archiveChannel(conversationId: string): void {
    this.setArchived(conversationId, true);
  }

  unarchiveChannel(conversationId: string): void {
    this.setArchived(conversationId, false);
  }

  async renameGroup(conversationId: string, name: string): Promise<void> {
    const group = this.chat.conversation(conversationId);
    if (group?.type !== 'group') {
      return;
    }
    this.chat.putConversation({ ...group, name });
    await this.data.renameGroup(conversationId, name);
  }

  async addToGroup(conversationId: string, userIds: readonly string[]): Promise<void> {
    const conversation = this.memberConversation(conversationId);
    if (conversation) {
      await this.setMembers(conversation, [...new Set([...conversation.memberIds, ...userIds])]);
    }
  }

  async removeFromGroup(conversationId: string, userId: string): Promise<void> {
    const conversation = this.memberConversation(conversationId);
    if (conversation) {
      await this.setMembers(
        conversation,
        conversation.memberIds.filter((memberId) => memberId !== userId),
      );
    }
  }

  private memberConversation(conversationId: string): MemberConversation | null {
    const conversation = this.chat.conversation(conversationId);
    return conversation && conversation.type !== 'dm' ? conversation : null;
  }

  private async setMembers(
    conversation: MemberConversation,
    memberIds: readonly string[],
  ): Promise<void> {
    this.chat.putConversation({ ...conversation, memberIds });
    await this.data.setMembers(conversation.id, memberIds);
  }

  private setLeft(conversationId: string, left: boolean): void {
    this.toggle(this.chat.leftIds, conversationId, left);
    void this.data.setLeft(conversationId, left);
  }

  private setArchived(conversationId: string, archived: boolean): void {
    this.toggle(this.chat.archivedIds, conversationId, archived);
    const channel = this.chat.conversation(conversationId);
    if (channel?.type === 'channel') {
      this.activity.record(channelArchiveEntry(channel, archived));
    }
    void this.data.setArchived(conversationId, archived);
  }

  private toggle(ids: WritableSignal<ReadonlySet<string>>, id: string, on: boolean): void {
    ids.update((current) => setIn(current, id, on));
  }
}
