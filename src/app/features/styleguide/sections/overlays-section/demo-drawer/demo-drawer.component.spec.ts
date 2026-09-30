import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { DemoDrawerComponent } from './demo-drawer.component';

describe('DemoDrawerComponent', () => {
  const close = vi.fn();

  const render = async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DIALOG_DATA, useValue: { heading: 'Details' } },
        { provide: DialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(DemoDrawerComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => close.mockClear());

  it('renders the heading and a scrolling list', async () => {
    const host = await render();

    expect(host.querySelector('h2')?.textContent?.trim()).toBe('Details');
    expect(host.querySelectorAll('.drawer__body .row').length).toBeGreaterThan(0);
  });

  it('closes from the footer button', async () => {
    const host = await render();

    host.querySelector<HTMLButtonElement>('.drawer__footer button')?.click();

    expect(close).toHaveBeenCalledTimes(1);
  });
});
