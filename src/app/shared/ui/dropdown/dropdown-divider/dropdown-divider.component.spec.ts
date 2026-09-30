import { TestBed } from '@angular/core/testing';
import { DropdownDividerComponent } from './dropdown-divider.component';

describe('DropdownDividerComponent', () => {
  it('renders a separator rule', async () => {
    const fixture = TestBed.createComponent(DropdownDividerComponent);
    await fixture.whenStable();
    const divider = fixture.nativeElement as HTMLElement;

    expect(divider.getAttribute('role')).toBe('separator');
    expect(divider.querySelector('.dropdown-divider__rule')).not.toBeNull();
  });
});
