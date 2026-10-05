import { TestBed } from '@angular/core/testing';
import { StatusDotComponent } from './status-dot.component';

describe('StatusDotComponent', () => {
  it('is decorative unless asked to announce', async () => {
    const fixture = TestBed.createComponent(StatusDotComponent);
    fixture.componentRef.setInput('status', 'away');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.classList.contains('status-dot--away')).toBe(true);
    expect(host.textContent?.trim()).toBe('');
  });

  it('gives every status its own shape class and size', async () => {
    const fixture = TestBed.createComponent(StatusDotComponent);
    fixture.componentRef.setInput('size', 'lg');
    const host = fixture.nativeElement as HTMLElement;

    for (const status of ['online', 'away', 'dnd', 'offline'] as const) {
      fixture.componentRef.setInput('status', status);
      await fixture.whenStable();
      expect([...host.classList].sort()).toEqual(
        [`status-dot--${status}`, 'status-dot--lg'].sort(),
      );
    }
  });

  it('announces the status as text when requested', async () => {
    const fixture = TestBed.createComponent(StatusDotComponent);
    fixture.componentRef.setInput('status', 'dnd');
    fixture.componentRef.setInput('announce', true);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.hasAttribute('aria-hidden')).toBe(false);
    expect(host.textContent?.trim()).toBe('Do not disturb');
  });
});
