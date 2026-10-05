import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ThreadPreview } from '../../../core/models/thread';
import { ThreadRowComponent } from './thread-row.component';

const THREAD: ThreadPreview = {
  replyCount: 4,
  lastReplyAt: Date.now() - 20 * 60_000,
  participantIds: ['u1', 'u4', 'u2'],
  unreadCount: 1,
  participants: [
    { id: 'u1', name: 'Rahul Mehta', seed: 1 },
    { id: 'u4', name: 'Kavya Reddy', seed: 4 },
    { id: 'u2', name: 'Priya Sharma', seed: 2 },
  ],
};

describe('ThreadRowComponent', () => {
  const render = async (thread: ThreadPreview) => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ThreadRowComponent);
    fixture.componentRef.setInput('thread', thread);
    fixture.componentRef.setInput('link', '/messages/g-launch/thread/g-launch-0');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('links to the thread with a spoken summary', async () => {
    const link = (await render(THREAD)).querySelector('a');

    expect(link?.getAttribute('href')).toBe('/messages/g-launch/thread/g-launch-0');
    expect(link?.getAttribute('aria-label')).toBe('Open thread, 4 replies, 1 new');
  });

  it('shows the last three participants, the reply count, the last reply and new replies', async () => {
    const host = await render(THREAD);

    expect(host.querySelectorAll('app-avatar').length).toBe(3);
    expect(host.querySelector('.thread-row__count')?.textContent).toBe('4 replies');
    expect(host.querySelector('.thread-row__last')?.textContent).toBe('Last reply 20m ago');
    expect(host.querySelector('.thread-row__new')?.textContent).toBe('1 new');
  });

  it('hides the new badge once the thread is read', async () => {
    const host = await render({ ...THREAD, replyCount: 1, unreadCount: 0 });

    expect(host.querySelector('.thread-row__new')).toBeNull();
    expect(host.querySelector('a')?.getAttribute('aria-label')).toBe('Open thread, 1 reply');
  });
});
