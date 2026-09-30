import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DropdownHeadingComponent } from './dropdown-heading.component';

@Component({
  imports: [DropdownHeadingComponent],
  template: `<app-dropdown-heading>Workspaces</app-dropdown-heading>`,
})
class DropdownHeadingHostComponent {}

describe('DropdownHeadingComponent', () => {
  it('renders the projected label without menu semantics', async () => {
    const fixture = TestBed.createComponent(DropdownHeadingHostComponent);
    await fixture.whenStable();
    const heading = (fixture.nativeElement as HTMLElement).querySelector(
      'app-dropdown-heading',
    ) as HTMLElement;

    expect(heading.textContent?.trim()).toBe('Workspaces');
    expect(heading.getAttribute('role')).toBe('presentation');
  });
});
