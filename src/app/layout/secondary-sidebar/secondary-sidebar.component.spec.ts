import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SecondarySidebarComponent } from './secondary-sidebar.component';

@Component({
  imports: [SecondarySidebarComponent],
  template: `
    <app-secondary-sidebar label="Settings sections">
      <h2 sidebarHeader>Settings</h2>
      <a href="/settings/account">Account</a>
    </app-secondary-sidebar>
  `,
})
class SidebarHostComponent {}

describe('SecondarySidebarComponent', () => {
  it('is a labelled navigation region that projects its content', async () => {
    const fixture = TestBed.createComponent(SidebarHostComponent);
    await fixture.whenStable();
    const navigation = (fixture.nativeElement as HTMLElement).querySelector('nav');

    expect(navigation?.getAttribute('aria-label')).toBe('Settings sections');
    expect(navigation?.querySelector('h2')?.textContent).toBe('Settings');
    expect(navigation?.querySelector('a')?.textContent).toBe('Account');
  });
});
