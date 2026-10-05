import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConversationPreview } from '../../../core/models/conversation';
import { ConversationItemComponent } from './conversation-item.component';

const PREVIEW: ConversationPreview = {
  id: 'dm-u1',
  type: 'dm',
  title: 'Rahul Mehta',
  avatarName: 'Rahul Mehta',
  avatarSeed: 1,
  avatarStatus: 'online',
  memberCount: 2,
  teamName: '',
  route: '/messages/dm-u1',
  preview: '@Aarav are we still shipping 2.4 on Thursday?',
  lastMessageAt: Date.now(),
  unreadCount: 1,
  starred: false,
  muted: false,
  typingText: '',
};

describe('ConversationItemComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  const render = async (conversation: ConversationPreview) => {
    const fixture = TestBed.createComponent(ConversationItemComponent);
    fixture.componentRef.setInput('conversation', conversation);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('links to the conversation and describes it for screen readers', async () => {
    const host = await render(PREVIEW);
    const link = host.querySelector('a');

    expect(link?.getAttribute('href')).toBe('/messages/dm-u1');
    expect(link?.getAttribute('aria-label')).toContain('Rahul Mehta, 1 unread, last message:');
    expect(host.classList.contains('conversation-item--unread')).toBe(true);
  });

  it('links a channel to its team route and names the team and favourite', async () => {
    const host = await render({
      ...PREVIEW,
      id: 'c-frontend',
      type: 'channel',
      title: '#frontend',
      teamName: 'Frontend',
      route: '/teams/t-frontend/channels/c-frontend',
      starred: true,
    });
    const link = host.querySelector('a');

    expect(link?.getAttribute('href')).toBe('/teams/t-frontend/channels/c-frontend');
    expect(link?.getAttribute('aria-label')).toContain('#frontend, Frontend team, favourite');
    expect(host.querySelector('.conversation-item__team')?.textContent?.trim()).toBe('Frontend');
  });

  it('shows the typing text instead of the preview', async () => {
    const host = await render({ ...PREVIEW, unreadCount: 0, typingText: 'Rahul is typing…' });

    expect(host.querySelector('.conversation-item__preview')?.textContent?.trim()).toBe(
      'Rahul is typing…',
    );
    expect(host.querySelector('.conversation-item__preview--typing')).not.toBeNull();
  });
});
