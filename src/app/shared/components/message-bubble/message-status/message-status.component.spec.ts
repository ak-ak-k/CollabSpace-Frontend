import { TestBed } from '@angular/core/testing';
import { MessageStatusComponent } from './message-status.component';

describe('MessageStatusComponent', () => {
  const render = async (failed: boolean) => {
    const fixture = TestBed.createComponent(MessageStatusComponent);
    fixture.componentRef.setInput('failed', failed);
    fixture.componentRef.setInput('status', {
      icon: 'circle-dashed',
      label: 'Sending…',
      accessibleLabel: 'Sending…',
      read: false,
    });
    await fixture.whenStable();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  };

  it('shows the delivery line while the message is on its way', async () => {
    const { host } = await render(false);

    expect(host.textContent?.trim()).toBe('Sending…');
    expect(host.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows Not sent with Retry and Delete when sending failed', async () => {
    const { fixture, host } = await render(true);
    const emitted: string[] = [];
    fixture.componentInstance.retry.subscribe(() => emitted.push('retry'));
    fixture.componentInstance.discard.subscribe(() => emitted.push('discard'));

    host.querySelectorAll('button').forEach((button) => button.click());

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Not sent');
    expect(emitted).toEqual(['retry', 'discard']);
  });
});
