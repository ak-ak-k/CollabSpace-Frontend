import { TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  it('is decorative and small by default', async () => {
    const fixture = TestBed.createComponent(SpinnerComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.classList.contains('spinner--md')).toBe(false);
  });

  it('reflects size and tone', async () => {
    const fixture = TestBed.createComponent(SpinnerComponent);
    fixture.componentRef.setInput('size', 'md');
    fixture.componentRef.setInput('tone', 'on-primary');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.classList.contains('spinner--md')).toBe(true);
    expect(host.classList.contains('spinner--on-primary')).toBe(true);
  });
});
