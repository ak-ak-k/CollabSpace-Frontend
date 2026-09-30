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
