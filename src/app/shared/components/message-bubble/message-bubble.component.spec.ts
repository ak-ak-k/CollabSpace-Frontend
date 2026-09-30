import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageView } from '../../../core/models/thread';
import { MessageBubbleComponent } from './message-bubble.component';

const MESSAGE: MessageView = {
  id: 'm1',
  authorId: 'u1',
  authorName: 'Rahul Mehta',
  authorFirstName: 'Rahul',
  authorSeed: 1,
  mine: false,
  continuation: false,
  sentAt: 0,
  time: '9:41 AM',
  text: '@Aarav are we shipping?',
  segments: [
    { text: '@Aarav', highlighted: true },
    { text: ' are we shipping?', highlighted: false },
  ],
  attachments: [],
  reactions: [],
  replyTo: null,
  pinned: false,
  edited: false,
  deliveryState: 'sent',
  showsDeliveryLine: false,
  accessibleLabel: 'Rahul Mehta, 9:41 AM: @Aarav are we shipping?',
};

describe('MessageBubbleComponent', () => {
  let fixture: ComponentFixture<MessageBubbleComponent>;
  let host: HTMLElement;

  const button = (label: string): HTMLButtonElement | undefined =>
    Array.from(host.querySelectorAll('button')).find(
      (candidate) => candidate.getAttribute('aria-label') === label,
    );

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageBubbleComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('message', MESSAGE);
  });

  it('renders a labelled article with author, time and highlighted body', async () => {
    await fixture.whenStable();

    expect(host.getAttribute('role')).toBe('article');
    expect(host.getAttribute('aria-label')).toBe(MESSAGE.accessibleLabel);
    expect(host.querySelector('.message__author')?.textContent).toBe('Rahul Mehta');
    expect(host.querySelector('.message__time')?.textContent).toBe('9:41 AM');
    expect(host.querySelector('.message__body')?.textContent).toBe('@Aarav are we shipping?');
    expect(host.querySelector('.message__highlight')?.textContent).toBe('@Aarav');
  });

  it('emits toolbar actions and quick reactions in pointer mode', async () => {
    const emitted: string[] = [];
    fixture.componentInstance.reply.subscribe(() => emitted.push('reply'));
    fixture.componentInstance.pin.subscribe(() => emitted.push('pin'));
    fixture.componentInstance.react.subscribe((emoji) => emitted.push(emoji));
    await fixture.whenStable();

    button('Reply')?.click();
    button('Pin message')?.click();
    button('Add reaction')?.click();
    await fixture.whenStable();
    button('React with 👍')?.click();
    await fixture.whenStable();

    expect(emitted).toEqual(['reply', 'pin', '👍']);
    expect(host.querySelector('[role="group"]')).toBeNull();
    expect(button('Edit')).toBeUndefined();
  });

  it('saves a changed edit on Enter and cancels on Escape, returning focus to the row', async () => {
    const saved: string[] = [];
    let cancelled = false;
    fixture.componentInstance.editSaved.subscribe((text) => saved.push(text));
    fixture.componentInstance.editCancelled.subscribe(() => (cancelled = true));
    fixture.componentRef.setInput('editing', true);
    await fixture.whenStable();
    const textarea = host.querySelector('textarea') as HTMLTextAreaElement;

    expect(document.activeElement).toBe(textarea);
    textarea.value = '  Shipping Thursday  ';
    textarea.dispatchEvent(new Event('input'));
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(saved).toEqual(['Shipping Thursday']);
    expect(cancelled).toBe(true);
    expect(document.activeElement).toBe(host);
  });

  it('asks for the actions sheet when tapped in touch mode', async () => {
    let requested = 0;
    fixture.componentInstance.actionsRequested.subscribe(() => requested++);
    fixture.componentRef.setInput('pointerActions', false);
    await fixture.whenStable();

    host.querySelector<HTMLElement>('.message__body')?.click();
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(requested).toBe(2);
    expect(host.querySelector('[role="toolbar"]')).toBeNull();
  });
});
