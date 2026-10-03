import {
  computed,
  DestroyRef,
  effect,
  inject,
  Service,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { ChatEvent, ChatSnapshot } from '../data/chat-events';
import { ChatData } from '../data/chat.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import { Channel } from '../models/channel';
import { Conversation, ConversationPreview } from '../models/conversation';
import { Message } from '../models/message';
import {
  advanceDelivery,
  appendMessage,
  firstUnreadId,
  releaseQueued,
  sum,
  Threads,
  toggleIn,
} from './chat-mutations';
import { buildPreview, PreviewContext } from './conversation-preview';
import { DataModeState } from './data-mode.state';
import { Loadable, settledStatus } from './loadable';
import { WorkspaceState } from './workspace.state';

const INITIAL_TYPING_DURATION = 7000;

@Service()
export class ChatState {
  private readonly data = inject(ChatData);
  private readonly dataMode = inject(DataModeState);
  private readonly workspace = inject(WorkspaceState);

  readonly conversations = signal<readonly Conversation[]>([]);
  readonly messages = signal<Threads>({});
  readonly unreadCounts = signal<Readonly<Record<string, number>>>({});
  readonly starredIds = signal<ReadonlySet<string>>(new Set());
  readonly mutedIds = signal<ReadonlySet<string>>(new Set());
  readonly typingUserIds = signal<Readonly<Record<string, readonly string[]>>>({});
  readonly activeConversationId = signal<string | null>(null);
  readonly newMessagesMarkerId = signal<string | null>(null);
  readonly incomingMessage = signal<Message | null>(null);

  private readonly loader = new Loadable<ChatSnapshot>({
    fetch: () => this.data.getConversations(),
    store: (snapshot) => this.store(snapshot),
    isEmpty: (snapshot) => snapshot.conversations.length === 0,
  });

  readonly status = this.loader.status;

  private initialTypingTimer?: ReturnType<typeof setTimeout>;

  private readonly previewContext = computed<PreviewContext>(() => ({
    usersById: this.workspace.usersById(),
    messages: this.messages(),
    unreadCounts: this.unreadCounts(),
    starredIds: this.starredIds(),
    mutedIds: this.mutedIds(),
    typingUserIds: this.typingUserIds(),
  }));

  private readonly scopedConversations = computed(() =>
    this.conversations().filter((conversation) =>
      this.workspace.containsConversation(conversation),
    ),
  );
  private readonly scopedUnreadCounts = computed(() =>
    this.scopedConversations().map((conversation) => this.unreadCounts()[conversation.id] ?? 0),
  );

  readonly previews = computed<readonly ConversationPreview[]>(() =>
    this.scopedConversations()
      .filter((conversation) => conversation.type !== 'channel')
      .map((conversation) => buildPreview(conversation, this.previewContext()))
      .sort((first, second) => second.lastMessageAt - first.lastMessageAt),
  );

  readonly inboxStatus = settledStatus(this.status, () => this.previews().length === 0);
  readonly unreadTotal = computed(() => sum(this.scopedUnreadCounts()));
  readonly unreadConversationCount = computed(
    () => this.scopedUnreadCounts().filter((count) => count > 0).length,
  );
  readonly unreadDirectTotal = computed(() =>
    sum(this.previews().map((preview) => preview.unreadCount)),
  );

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
    const subscription = this.data.events$.subscribe((event) => this.apply(event));
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

  open(conversationId: string | null): void {
    this.activeConversationId.set(conversationId);
    if (!conversationId) {
      return;
    }
    const unread = this.unreadCounts()[conversationId] ?? 0;
    this.newMessagesMarkerId.set(firstUnreadId(this.messages()[conversationId] ?? [], unread));
    this.markRead(conversationId);
  }

  markRead(conversationId: string): void {
    if (this.unreadCounts()[conversationId]) {
      this.setUnread(conversationId, 0);
    }
  }

  markUnread(conversationId: string): void {
    this.setUnread(conversationId, Math.max(1, this.unreadCounts()[conversationId] ?? 0));
  }

  toggleStar(conversationId: string): boolean {
    return this.toggleFlag(this.starredIds, conversationId, (on) =>
      this.data.setStarred(conversationId, on),
    );
  }

  toggleMute(conversationId: string): boolean {
    return this.toggleFlag(this.mutedIds, conversationId, (on) =>
      this.data.setMuted(conversationId, on),
    );
  }

  async openDirectConversation(userId: string): Promise<string> {
    const conversation = await this.data.ensureDirectConversation(
      userId,
      this.workspace.currentWorkspaceId(),
    );
    if (!this.conversation(conversation.id)) {
      this.conversations.update((conversations) => [...conversations, conversation]);
    }
    return conversation.id;
  }

  async createGroup(name: string, memberIds: readonly string[]): Promise<string> {
    const group = await this.data.createGroup(name, memberIds, this.workspace.currentWorkspaceId());
    this.conversations.update((conversations) => [...conversations, group]);
    return group.id;
  }

  addChannel(channel: Channel): void {
    const conversation = this.data.addChannel(channel);
    this.conversations.update((conversations) => [...conversations, conversation]);
  }

  setTyping(conversationId: string, userIds: readonly string[]): void {
    this.typingUserIds.update((typing) => ({ ...typing, [conversationId]: userIds }));
  }

  flushQueue(): void {
    this.messages.update(releaseQueued);
  }

  private setUnread(conversationId: string, count: number): void {
    this.unreadCounts.update((counts) => ({ ...counts, [conversationId]: count }));
    void this.data.setUnread(conversationId, count);
  }

  private toggleFlag(
    ids: WritableSignal<ReadonlySet<string>>,
    conversationId: string,
    persist: (on: boolean) => Promise<void>,
  ): boolean {
    ids.update((current) => toggleIn(current, conversationId));
    const on = ids().has(conversationId);
    void persist(on);
    return on;
  }

  private apply(event: ChatEvent): void {
    if (event.type === 'typing') {
      this.setTyping(event.conversationId, event.userIds);
    } else if (event.type === 'delivery') {
      this.messages.update((threads) =>
        advanceDelivery(threads, event.conversationId, CURRENT_USER_ID, event.state),
      );
    } else {
      this.receive(event.message);
    }
  }

  private receive(message: Message): void {
    this.messages.update((threads) => appendMessage(threads, message));
    if (message.conversationId === this.activeConversationId()) {
      return;
    }
    this.unreadCounts.update((counts) => ({
      ...counts,
      [message.conversationId]: (counts[message.conversationId] ?? 0) + 1,
    }));
    this.incomingMessage.set(message);
  }

  private store(snapshot: ChatSnapshot): void {
    this.conversations.set(snapshot.conversations);
    this.messages.set(snapshot.messages);
    this.unreadCounts.set(snapshot.unreadCounts);
    this.starredIds.set(new Set(snapshot.starredIds));
    this.mutedIds.set(new Set(snapshot.mutedIds));
    this.typingUserIds.set(snapshot.typingUserIds);
    this.stopInitialTypingSoon();
    this.open(this.activeConversationId());
  }

  private stopInitialTypingSoon(): void {
    clearTimeout(this.initialTypingTimer);
    this.initialTypingTimer = setTimeout(() => this.typingUserIds.set({}), INITIAL_TYPING_DURATION);
  }
}
