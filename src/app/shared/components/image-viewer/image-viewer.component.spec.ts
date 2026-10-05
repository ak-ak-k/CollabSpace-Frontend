import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { ToastService } from '../../../core/services/toast.service';
import { ImageViewerComponent, ImageViewerData } from './image-viewer.component';

const IMAGE: ImageViewerData = { name: 'release-banner-v2.png', size: '640 KB', src: '' };

describe('ImageViewerComponent', () => {
  const render = async () => {
    const close = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: DIALOG_DATA, useValue: IMAGE },
        { provide: DialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(ImageViewerComponent);
    await fixture.whenStable();
    return { host: fixture.nativeElement as HTMLElement, close };
  };

  const button = (host: HTMLElement, label: string) =>
    host.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);

  it('shows the image name and size and marks Close as the first focus target', async () => {
    const { host } = await render();

    expect(host.querySelector('.viewer__name')?.textContent).toBe('release-banner-v2.png');
    expect(host.querySelector('.viewer__size')?.textContent).toBe('640 KB');
    expect(button(host, 'Close image')?.hasAttribute('cdkFocusInitial')).toBe(true);
    expect(host.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(IMAGE.name);
  });

  it('closes from the Close button and announces downloads', async () => {
    const { host, close } = await render();
    const toasts = TestBed.inject(ToastService);

    button(host, 'Download image')?.click();
    button(host, 'Close image')?.click();

    expect(toasts.toasts()[0].message).toBe('Downloading release-banner-v2.png');
    expect(close).toHaveBeenCalled();
  });
});
