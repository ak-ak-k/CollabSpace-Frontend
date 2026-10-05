import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComposerSubmission, MentionCandidate } from '../../../core/models/thread';
import { MessageComposerComponent } from './message-composer.component';

const person = (id: string, name: string, title: string): MentionCandidate => ({
  id,
  kind: 'member',
  token: `@${name.split(' ')[0]}`,
  name,
  firstName: name.split(' ')[0],
  title,
  seed: 1,
});

const MENTIONS: readonly MentionCandidate[] = [
  person('u2', 'Rahul Mehta', 'Engineer'),
  person('u3', 'Ananya Singh', 'Designer'),
  {
    id: 'c-frontend',
    kind: 'channel',
    token: '#frontend',
    name: '#frontend',
    firstName: 'frontend',
    title: 'Frontend',
    seed: 0,
  },
];

type Fixture = ComponentFixture<MessageComposerComponent>;

class ResizeObserverStub {
  observe(): void {}
  disconnect(): void {}
}

const render = async () => {
  const fixture = TestBed.createComponent(MessageComposerComponent);
  fixture.componentRef.setInput('conversationTitle', 'Design team');
  fixture.componentRef.setInput('mentions', MENTIONS);
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

  it('suggests channels under a Channels heading after #', async () => {
    const { fixture, host, textarea } = await render();
    await type(fixture, textarea, 'See #fr');

    expect(host.querySelector('.mention-list__header')?.textContent).toBe('Channels');

    press(textarea, 'Tab');
    await fixture.whenStable();

    expect(textarea.value).toBe('See #frontend ');
  });

  it('shows the formatting toolbar from the Formatting toggle and wraps the selection on Ctrl+B', async () => {
    const { fixture, host, textarea } = await render();
    const toggle = host.querySelector('button[aria-label="Formatting"]') as HTMLButtonElement;

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[role="toolbar"][aria-label="Formatting"]')).not.toBeNull();

    await type(fixture, textarea, 'ship it');
    textarea.setSelectionRange(5, 7);
    const event = press(textarea, 'b', { ctrlKey: true });
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    expect(textarea.value).toBe('ship **it**');
    expect([textarea.selectionStart, textarea.selectionEnd]).toEqual([7, 9]);
  });
});
