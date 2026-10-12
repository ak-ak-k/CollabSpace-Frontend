import { computed, DestroyRef, effect, inject, Service, signal, untracked } from '@angular/core';
import { ChatSnapshot } from '../data/chat-events';
import { ChatData } from '../data/chat.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import { Conversation, ConversationPreview, NotifyLevel } from '../models/conversation';
import { Message, SavedEntry } from '../models/message';
import { threadKey } from '../models/thread';
import { firstUnreadId, sum, Threads } from './chat-mutations';
import {
  isListed,
  ListingContext,
  savedMessagesOf,
  timelinesOf,
  unreadFromHere,
} from './chat-selectors';
import { applyChatEvent, applySnapshot, Counts } from './chat-sync';
import { buildPreview, PreviewContext, typingTextOf } from './conversation-preview';
import { DataModeState } from './data-mode.state';
import { Loadable, settledStatus } from './loadable';
import { WorkspaceState } from './workspace.state';

const INITIAL_TYPING_DURATION = 7000;

const privateChannelId = (channel: Channel): string[] => (channel.isPrivate ? [channel.id] : []);

@Service()
export class ChatState {
  private readonly data = inject(ChatData);
  private readonly dataMode = inject(DataModeState);
  private readonly workspace = inject(WorkspaceState);

  readonly conversations = signal<readonly Conversation[]>([]);
  readonly messages = signal<Threads>({});
  readonly unreadCounts = signal<Counts>({});
  readonly threadUnreadCounts = signal<Counts>({});
  readonly starredIds = signal<ReadonlySet<string>>(new Set());
  readonly mutedIds = signal<ReadonlySet<string>>(new Set());
  readonly leftIds = signal<ReadonlySet<string>>(new Set());
  readonly archivedIds = signal<ReadonlySet<string>>(new Set());
  readonly notifyLevels = signal<Readonly<Record<string, NotifyLevel>>>({});
  readonly saved = signal<Readonly<Record<string, SavedEntry>>>({});
  readonly typingUserIds = signal<Readonly<Record<string, readonly string[]>>>({});
  readonly activeConversationId = signal<string | null>(null);
  readonly activeThreadId = signal<string | null>(null);
  readonly newMessagesMarkerId = signal<string | null>(null);

  private readonly loader = new Loadable<ChatSnapshot>({
    fetch: () => this.data.getConversations(),
    store: (snapshot) => this.store(snapshot),
    isEmpty: (snapshot) => snapshot.conversations.length === 0,
  });

  readonly status = this.loader.status;
  readonly timelines = computed(() => timelinesOf(this.messages()));

  private initialTypingTimer?: ReturnType<typeof setTimeout>;

  private readonly previewContext = computed<PreviewContext>(() => ({
    usersById: this.workspace.usersById(),
    messages: this.timelines(),
    unreadCounts: this.unreadCounts(),
    starredIds: this.starredIds(),
    mutedIds: this.mutedIds(),
    typingUserIds: this.typingUserIds(),
    teamNames: new Map(this.workspace.teams().map((team) => [team.id, team.name])),
  }));

  private readonly listing = computed<ListingContext>(() => ({
    currentUserId: CURRENT_USER_ID,
    leftIds: this.leftIds(),
    archivedIds: this.archivedIds(),
    joinedTeamIds: new Set(this.workspace.joinedTeams().map((team) => team.id)),
    privateChannelIds: new Set(this.workspace.channels().flatMap(privateChannelId)),
  }));

  readonly previews = computed<readonly ConversationPreview[]>(() =>
    this.conversations()
      .filter((conversation) => this.workspace.containsConversation(conversation))
      .filter((conversation) => isListed(conversation, this.listing()))
      .map((conversation) => buildPreview(conversation, this.previewContext()))
      .sort((first, second) => second.lastMessageAt - first.lastMessageAt),
  );

  readonly inboxStatus = settledStatus(this.status, () => this.previews().length === 0);
  readonly unreadTotal = computed(() => sum(this.previews().map((preview) => preview.unreadCount)));
  readonly unreadConversationCount = computed(
    () => this.previews().filter((preview) => preview.unreadCount > 0).length,
  );
  readonly unreadDirectTotal = computed(() =>
    sum(
      this.previews()
        .filter((preview) => preview.type !== 'channel')
        .map((preview) => preview.unreadCount),
    ),
  );
  readonly savedMessages = computed(() =>
    savedMessagesOf(this.saved(), this.messages(), (id) => this.inCurrentWorkspace(id)),
  );

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
    const subscription = this.data.events$.subscribe((event) => applyChatEvent(this, event));
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  conversation(conversationId: string): Conversation | null {
    return this.conversations().find((candidate) => candidate.id === conversationId) ?? null;
  }

  inCurrentWorkspace(conversationId: string): boolean {
    const conversation = this.conversation(conversationId);
    return !!conversation && this.workspace.containsConversation(conversation);
  }

  preview(conversationId: string): ConversationPreview | null {
    const conversation = this.conversation(conversationId);
    return conversation ? buildPreview(conversation, this.previewContext()) : null;
  }

  timeline(conversationId: string): readonly Message[] {
    return this.timelines()[conversationId] ?? [];
  }

  threadTypingText(conversationId: string, rootId: string): string {
    const typing = this.typingUserIds()[threadKey(conversationId, rootId)] ?? [];
    return typingTextOf(typing, this.previewContext());
  }

  hasLeft(conversationId: string): boolean {
    return this.leftIds().has(conversationId);
  }

  isArchived(conversationId: string): boolean {
    return this.archivedIds().has(conversationId);
  }

  isSaved(messageId: string): boolean {
    return messageId in this.saved();
  }

  notifyLevel(conversationId: string): NotifyLevel {
    const muted = this.mutedIds().has(conversationId);
    return this.notifyLevels()[conversationId] ?? (muted ? 'muted' : 'all');
  }

  open(conversationId: string | null): void {
    this.activeConversationId.set(conversationId);
    if (!conversationId) {
      return;
    }
    const unread = this.unreadCounts()[conversationId] ?? 0;
    this.newMessagesMarkerId.set(firstUnreadId(this.timeline(conversationId), unread));
    this.markRead(conversationId);
  }

  openThread(rootId: string | null): void {
    this.activeThreadId.set(rootId);
    if (rootId) {
      this.markThreadRead(rootId);
    }
  }

  markRead(conversationId: string): void {
    if (this.unreadCounts()[conversationId]) {
      this.setUnreadCount(conversationId, 0);
    }
  }

  markUnread(conversationId: string): void {
    this.setUnreadCount(conversationId, Math.max(1, this.unreadCounts()[conversationId] ?? 0));
  }

  markUnreadFrom(conversationId: string, messageId: string): boolean {
    const count = unreadFromHere(this.timeline(conversationId), messageId, CURRENT_USER_ID);
    if (count !== null) {
      this.setUnreadCount(conversationId, count);
    }
    return count !== null;
  }

  markThreadRead(rootId: string): void {
    if (this.threadUnreadCounts()[rootId]) {
      this.threadUnreadCounts.update((counts) => ({ ...counts, [rootId]: 0 }));
      void this.data.setThreadUnread(rootId, 0);
    }
  }

  async openDirectConversation(userId: string): Promise<string> {
    const conversation = await this.data.ensureDirectConversation(
      userId,
      this.workspace.currentWorkspaceId(),
    );
    this.putConversation(conversation);
    return conversation.id;
  }

  async createGroup(name: string, memberIds: readonly string[]): Promise<string> {
    const group = await this.data.createGroup(name, memberIds, this.workspace.currentWorkspaceId());
    this.putConversation(group);
    return group.id;
  }

  addChannel(channel: Channel): void {
    this.putConversation(this.data.addChannel(channel));
  }

  syncChannel(channel: Channel): void {
    const existing = this.conversation(channel.id);
    const memberIds = existing?.type === 'channel' ? existing.memberIds : channel.memberIds;
    this.putConversation(this.data.syncChannel({ ...channel, memberIds }));
  }

  putConversation(conversation: Conversation): void {
    this.conversations.update((conversations) =>
      conversations.some((candidate) => candidate.id === conversation.id)
        ? conversations.map((candidate) =>
            candidate.id === conversation.id ? conversation : candidate,
          )
        : [...conversations, conversation],
    );
  }

  setUnreadCount(conversationId: string, count: number): void {
    this.unreadCounts.update((counts) => ({ ...counts, [conversationId]: count }));
    void this.data.setUnread(conversationId, count);
  }

  private store(snapshot: ChatSnapshot): void {
    applySnapshot(this, snapshot);
    this.stopInitialTypingSoon();
    this.open(this.activeConversationId());
  }

  private stopInitialTypingSoon(): void {
    clearTimeout(this.initialTypingTimer);
    this.initialTypingTimer = setTimeout(() => this.typingUserIds.set({}), INITIAL_TYPING_DURATION);
  }
}
