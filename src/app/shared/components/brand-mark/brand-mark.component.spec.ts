import { TestBed } from '@angular/core/testing';
import { BrandMarkComponent } from './brand-mark.component';

describe('BrandMarkComponent', () => {
  it('renders the decorative C mark at the requested size', async () => {
    const fixture = TestBed.createComponent(BrandMarkComponent);
    fixture.componentRef.setInput('size', 'sm');
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent?.trim()).toBe('C');
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.classList.contains('brand-mark--sm')).toBe(true);
  });
});
