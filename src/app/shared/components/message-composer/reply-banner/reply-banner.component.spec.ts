import { TestBed } from '@angular/core/testing';
import { ReplyBannerComponent } from './reply-banner.component';

describe('ReplyBannerComponent', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(ReplyBannerComponent);
    fixture.componentRef.setInput('reply', { authorFirstName: 'Rahul', text: 'Ship on Thursday?' });
    await fixture.whenStable();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  };

  it('names who is being replied to', async () => {
    const { host } = await render();

    expect(host.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Replying to Rahul — Ship on Thursday?',
    );
    expect(host.querySelector('button')?.getAttribute('aria-label')).toBe('Cancel reply');
  });

  it('emits cancel from the close button', async () => {
    const { fixture, host } = await render();
    let cancelled = 0;
    fixture.componentInstance.cancel.subscribe(() => cancelled++);

    host.querySelector('button')?.click();

    expect(cancelled).toBe(1);
  });
});
