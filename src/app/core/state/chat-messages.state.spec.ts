import { TestBed } from '@angular/core/testing';
import { ChatMessagesState, SEND_ACKNOWLEDGE_DELAY } from './chat-messages.state';
import { ChatState } from './chat.state';
import { NetworkState } from './network.state';
import { INSTANT_MOCK_DATA, settle } from './state.testing';
import { WorkspaceState } from './workspace.state';

const FAILED_ID = 'g-design-f1';

describe('ChatMessagesState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [INSTANT_MOCK_DATA, { provide: SEND_ACKNOWLEDGE_DELAY, useValue: 0 }],
    });
  });

  const load = async () => {
    TestBed.inject(WorkspaceState);
    const chat = TestBed.inject(ChatState);
    await settle();
    const deliveryOf = (id: string) =>
      chat.messages()['g-design'].find((message) => message.id === id)?.deliveryState;
    return { chat, messages: TestBed.inject(ChatMessagesState), deliveryOf };
  };

  it('shows a new message as sending until the server acknowledges it', async () => {
    const { chat, messages } = await load();

    const sent = await messages.send('dm-u2', { text: 'Hi', attachments: [], replyToId: null });
    expect(sent.deliveryState).toBe('sending');

    await settle();
    expect(chat.messages()['dm-u2'].at(-1)?.deliveryState).toBe('sent');
  });

  it('refuses to retry while offline and resends once back online', async () => {
    const { messages, deliveryOf } = await load();
    const network = TestBed.inject(NetworkState);

    network.simulateOffline(true);
    expect(await messages.retry('g-design', FAILED_ID)).toBe(false);
    expect(deliveryOf(FAILED_ID)).toBe('failed');

    network.simulateOffline(false);
    expect(await messages.retry('g-design', FAILED_ID)).toBe(true);
    await settle();
    expect(deliveryOf(FAILED_ID)).toBe('sent');
  });

  it('discards an unsent message and can put it back', async () => {
    const { chat, messages, deliveryOf } = await load();

    const removed = await messages.remove('g-design', FAILED_ID);
    expect(deliveryOf(FAILED_ID)).toBeUndefined();

    await messages.restore(removed!);
    expect(deliveryOf(FAILED_ID)).toBe('failed');
    expect(chat.preview('g-design')?.preview).toContain('icon audit');
  });

  it('marks unread from a message using only the replies from other people', async () => {
    const { chat } = await load();
    const timeline = chat.timeline('g-launch');
    const fromOthers = timeline.slice(-3).filter((message) => message.authorId !== 'u0').length;

    expect(chat.markUnreadFrom('g-launch', timeline.at(-3)!.id)).toBe(true);
    expect(chat.preview('g-launch')?.unreadCount).toBe(Math.max(1, fromOthers));
    expect(chat.markUnreadFrom('g-launch', 'missing')).toBe(false);
  });
});
