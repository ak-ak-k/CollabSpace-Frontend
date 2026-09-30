import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OfflineBannerComponent } from './offline-banner.component';

describe('OfflineBannerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('announces the offline state and links to details', async () => {
    const fixture = TestBed.createComponent(OfflineBannerComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('role')).toBe('status');
    expect(host.textContent).toContain('You’re offline.');
    expect(host.querySelector('a')?.getAttribute('href')).toBe('/offline');
  });

  it('asks to retry when the button is pressed', async () => {
    const fixture = TestBed.createComponent(OfflineBannerComponent);
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();

    expect(retried).toBe(true);
  });
});
