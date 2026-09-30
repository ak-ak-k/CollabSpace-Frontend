import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout.component';

describe('AuthLayoutComponent', () => {
  let fixture: ComponentFixture<AuthLayoutComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(AuthLayoutComponent);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('renders the poster with the brand and the headline', () => {
    const poster = host.querySelector('aside');

    expect(poster?.getAttribute('aria-label')).toBe('About CollabSpace');
    expect(poster?.querySelector('.auth__wordmark')?.textContent).toBe('CollabSpace');
    expect(poster?.querySelector('.auth__headline')?.textContent).toBe(
      'Conversations, tasks and files. One ruled space.',
    );
  });

  it('lists the three numbered points in order', () => {
    const points = Array.from(host.querySelectorAll('.auth__point')).map((point) =>
      Array.from(point.children).map((part) => part.textContent),
    );

    expect(points).toEqual([
      ['01', 'Channels, direct messages and group chats'],
      ['02', 'A task board that moves with the conversation'],
      ['03', 'Files, search and presence in one place'],
    ]);
  });

  it('hosts the routed screen inside the main landmark', () => {
    expect(host.querySelector('main router-outlet')).not.toBeNull();
  });
});
