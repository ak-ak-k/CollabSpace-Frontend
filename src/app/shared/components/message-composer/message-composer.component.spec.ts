import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComposerSubmission, MentionCandidate } from '../../../core/models/thread';
import { MessageComposerComponent } from './message-composer.component';

const MEMBERS: readonly MentionCandidate[] = [
  { id: 'u2', name: 'Rahul Mehta', firstName: 'Rahul', title: 'Engineer', seed: 1 },
  { id: 'u3', name: 'Ananya Singh', firstName: 'Ananya', title: 'Designer', seed: 2 },
];

type Fixture = ComponentFixture<MessageComposerComponent>;

class ResizeObserverStub {
  observe(): void {}
  disconnect(): void {}
}

const render = async () => {
  const fixture = TestBed.createComponent(MessageComposerComponent);
  fixture.componentRef.setInput('conversationTitle', 'Design team');
  fixture.componentRef.setInput('members', MEMBERS);
  await fixture.whenStable();
  const host = fixture.nativeElement as HTMLElement;
  const textarea = host.querySelector('textarea') as HTMLTextAreaElement;
  const sendButton = host.querySelector('button[type="submit"]') as HTMLButtonElement;
  return { fixture, host, textarea, sendButton };
};

const type = async (fixture: Fixture, textarea: HTMLTextAreaElement, text: string) => {
  textarea.value = text;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  await fixture.whenStable();
};

const press = (textarea: HTMLTextAreaElement, key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  textarea.dispatchEvent(event);
  return event;
};

describe('MessageComposerComponent', () => {
  beforeAll(() => vi.stubGlobal('ResizeObserver', ResizeObserverStub));
  afterAll(() => vi.unstubAllGlobals());

  it('sends the trimmed draft on Enter and clears the box', async () => {
    const { fixture, textarea } = await render();
    const sent: ComposerSubmission[] = [];
    fixture.componentInstance.send.subscribe((submission) => sent.push(submission));
    await type(fixture, textarea, '  Hello team  ');

    const event = press(textarea, 'Enter');
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    expect(sent).toEqual([{ text: 'Hello team', attachments: [], replyToId: null }]);
    expect(textarea.value).toBe('');
  });

  it('keeps Shift+Enter as a new line', async () => {
    const { fixture, textarea } = await render();
    let sends = 0;
    fixture.componentInstance.send.subscribe(() => sends++);
    await type(fixture, textarea, 'Hello');

    const event = press(textarea, 'Enter', { shiftKey: true });

    expect(event.defaultPrevented).toBe(false);
    expect(sends).toBe(0);
  });

  it('disables Send until there is something to send', async () => {
    const { fixture, textarea, sendButton } = await render();

    expect(sendButton.disabled).toBe(true);

    await type(fixture, textarea, 'Hi');

    expect(sendButton.disabled).toBe(false);
  });

  it('turns read-only while the workspace is archived', async () => {
    const { fixture, textarea, sendButton } = await render();
    let sends = 0;
    fixture.componentInstance.send.subscribe(() => sends++);
    fixture.componentRef.setInput('archivedWorkspace', 'Northstar Labs');
    await type(fixture, textarea, 'Hi');

    press(textarea, 'Enter');

    expect(textarea.placeholder).toBe('Northstar Labs is archived — read-only');
    expect(sendButton.disabled).toBe(true);
    expect(sends).toBe(0);
  });

  it('asks to edit the last message on ArrowUp in an empty draft', async () => {
    const { fixture, textarea } = await render();
    let requested = 0;
    fixture.componentInstance.editLastRequested.subscribe(() => requested++);

    press(textarea, 'ArrowUp');

    expect(requested).toBe(1);
  });

  it('opens the mention list on @ and inserts the chosen name', async () => {
    const { fixture, host, textarea } = await render();
    await type(fixture, textarea, 'Hey @an');

    const listbox = host.querySelector('[role="listbox"]');
    expect(listbox?.textContent).toContain('Ananya Singh');
    expect(textarea.hasAttribute('role')).toBe(false);
    expect(textarea.getAttribute('aria-controls')).toBe(listbox?.id);

    press(textarea, 'Enter');
    await fixture.whenStable();

    expect(textarea.value).toBe('Hey @Ananya ');
    expect(host.querySelector('[role="listbox"]')).toBeNull();
    expect(textarea.hasAttribute('aria-controls')).toBe(false);
  });

  it('appends the mention trigger to an untouched draft from the Mention button', async () => {
    const { fixture, host, textarea } = await render();
    fixture.componentRef.setInput('draft', 'Hello');
    await fixture.whenStable();

    (host.querySelector('button[aria-label="Mention someone"]') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(textarea.value).toBe('Hello @');
    expect(host.querySelectorAll('[role="option"]')).toHaveLength(2);
  });
});
