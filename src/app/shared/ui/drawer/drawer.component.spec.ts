import { DialogRef } from '@angular/cdk/dialog';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawerComponent } from './drawer.component';

@Component({
  imports: [DrawerComponent],
  template: `
    <app-drawer heading="Details" [hideHeading]="hideHeading()">
      <p class="content">Members</p>
      <button drawerFooter type="button">Sign out</button>
    </app-drawer>
  `,
})
class DrawerHostComponent {
  readonly hideHeading = signal(false);
}

describe('DrawerComponent', () => {
  const close = vi.fn();

  const render = async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: DialogRef, useValue: { close } }],
    });
    const fixture = TestBed.createComponent(DrawerHostComponent);
    await fixture.whenStable();
    const drawer = (fixture.nativeElement as HTMLElement).querySelector(
      'app-drawer',
    ) as HTMLElement;
    return { fixture, drawer };
  };

  beforeEach(() => close.mockClear());

  it('renders the heading, body and footer', async () => {
    const { drawer } = await render();

    expect(drawer.querySelector('h2')?.textContent?.trim()).toBe('Details');
    expect(drawer.querySelector('.drawer__body .content')).not.toBeNull();
    expect(drawer.querySelector('.drawer__footer button')?.textContent).toBe('Sign out');
  });

  it('keeps a hidden heading available to assistive technology', async () => {
    const { fixture, drawer } = await render();

    fixture.componentInstance.hideHeading.set(true);
    await fixture.whenStable();

    expect(drawer.querySelector('h2')?.classList.contains('visually-hidden')).toBe(true);
  });

  it('closes the enclosing drawer from the close button', async () => {
    const { drawer } = await render();

    drawer.querySelector<HTMLButtonElement>('button[aria-label="Close"]')?.click();

    expect(close).toHaveBeenCalledTimes(1);
  });
});
