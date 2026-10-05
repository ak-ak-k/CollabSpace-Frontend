import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageView } from '../../../core/models/thread';
import { MessageBubbleComponent } from './message-bubble.component';
import { MessageCommand } from './message-menu';

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
  text: '@Aarav are we **shipping**?',
  segments: [
    { text: '@Aarav', style: 'mention', href: null },
    { text: ' are we ', style: 'plain', href: null },
    { text: 'shipping', style: 'bold', href: null },
    { text: '?', style: 'plain', href: null },
  ],
  attachments: [],
  reactions: [],
  replyTo: null,
  isReply: false,
  thread: null,
  saved: true,
  mentionsMe: true,
  pinned: false,
  edited: false,
  deliveryState: 'sent',
  showsDeliveryLine: false,
  accessibleLabel: 'Rahul Mehta, 9:41 AM, saved, mentions you: @Aarav are we **shipping**?',
};

describe('MessageBubbleComponent', () => {
  let fixture: ComponentFixture<MessageBubbleComponent>;
  let host: HTMLElement;
  let commands: MessageCommand[];

  const button = (label: string): HTMLButtonElement | undefined =>
    Array.from(host.querySelectorAll('button')).find(
      (candidate) => candidate.getAttribute('aria-label') === label,
    );

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageBubbleComponent);
    host = fixture.nativeElement as HTMLElement;
    commands = [];
    fixture.componentInstance.command.subscribe((command) => commands.push(command));
    fixture.componentRef.setInput('message', MESSAGE);
  });

  it('renders a labelled article with formatted text, the Saved flag and the mention highlight', async () => {
    await fixture.whenStable();

    expect(host.getAttribute('role')).toBe('article');
    expect(host.getAttribute('aria-label')).toBe(MESSAGE.accessibleLabel);
    expect(host.classList.contains('message--mention')).toBe(true);
    expect(host.querySelector('.message__author')?.textContent).toBe('Rahul Mehta');
    expect(host.querySelector('.message-text')?.textContent).toBe('@Aarav are we shipping?');
    expect(host.querySelector('.message-text__mention')?.textContent).toBe('@Aarav');
    expect(host.querySelector('strong')?.textContent).toBe('shipping');
    expect(host.querySelector('.message__flag')?.textContent?.trim()).toBe('Saved');
  });

  it('offers reaction, thread, save and more actions in the hover toolbar', async () => {
    const reactions: string[] = [];
    fixture.componentInstance.react.subscribe((emoji) => reactions.push(emoji));
    await fixture.whenStable();

    button('Reply in thread')?.click();
    button('Remove from saved')?.click();
    button('Add reaction')?.click();
    await fixture.whenStable();
    button('React with thumbs up')?.click();
    await fixture.whenStable();

    expect(commands).toEqual(['thread', 'save']);
    expect(reactions).toEqual(['👍']);
    expect(host.querySelector('[role="menu"]')).toBeNull();
    expect(button('More actions')?.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('shows Not sent with Retry and Delete for a failed message of mine', async () => {
    fixture.componentRef.setInput('message', {
      ...MESSAGE,
      mine: true,
      deliveryState: 'failed',
    });
    await fixture.whenStable();

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Not sent');
    button('Retry sending')?.click();
    button('Delete unsent message')?.click();

    expect(commands).toEqual(['retry', 'discard']);
  });

  it('saves a changed edit on Enter and cancels on Escape, returning focus to the row', async () => {
    const saved: string[] = [];
    fixture.componentInstance.editSaved.subscribe((text) => saved.push(text));
    fixture.componentRef.setInput('editing', true);
    await fixture.whenStable();
    const textarea = host.querySelector('textarea') as HTMLTextAreaElement;

    expect(document.activeElement).toBe(textarea);
    textarea.value = '  Shipping Thursday  ';
    textarea.dispatchEvent(new Event('input'));
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(saved).toEqual(['Shipping Thursday']);
    expect(commands).toEqual(['editCancel']);
    expect(document.activeElement).toBe(host);
  });

  it('asks for the actions sheet on tap or long-press in touch mode', async () => {
    fixture.componentRef.setInput('pointerActions', false);
    await fixture.whenStable();

    host.querySelector<HTMLElement>('.message-text')?.click();
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    const press = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    host.querySelector('.message-text')?.dispatchEvent(press);

    expect(commands).toEqual(['actions', 'actions', 'actions']);
    expect(press.defaultPrevented).toBe(true);
    expect(host.querySelector('[role="toolbar"]')).toBeNull();
  });

  it('jumps to the message when tapped as a search result', async () => {
    fixture.componentRef.setInput('jumpOnTap', true);
    await fixture.whenStable();

    host.querySelector<HTMLElement>('.message-text')?.click();

    expect(commands).toEqual(['jump']);
  });
});
