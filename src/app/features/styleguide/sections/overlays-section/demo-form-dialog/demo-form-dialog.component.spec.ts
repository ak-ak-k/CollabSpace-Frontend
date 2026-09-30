import { DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { DemoFormDialogComponent } from './demo-form-dialog.component';

describe('DemoFormDialogComponent', () => {
  const close = vi.fn();

  const render = async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: DialogRef, useValue: { close } }],
    });
    const fixture = TestBed.createComponent(DemoFormDialogComponent);
    await fixture.whenStable();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  };

  const submit = (host: HTMLElement) =>
    host.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));

  beforeEach(() => close.mockClear());

  it('renders the modal with labelled fields and actions', async () => {
    const { host } = await render();
    const labels = Array.from(host.querySelectorAll('label')).map((label) =>
      label.textContent?.trim(),
    );

    expect(host.querySelector('h2')?.textContent?.trim()).toBe('New group chat');
    expect(labels).toEqual(['Group name', 'Purpose (optional)']);
    expect(host.querySelectorAll('.modal__actions button').length).toBe(2);
  });

  it('keeps the dialog open while the name is missing', async () => {
    const { fixture, host } = await render();

    submit(host);
    await fixture.whenStable();

    expect(close).not.toHaveBeenCalled();
    expect(host.textContent).toContain('Give the group a name.');
  });

  it('closes with the group name', async () => {
    const { fixture, host } = await render();
    const name = host.querySelector('input') as HTMLInputElement;

    name.value = 'Launch crew';
    name.dispatchEvent(new Event('input'));
    submit(host);
    await fixture.whenStable();

    expect(close).toHaveBeenCalledWith('Launch crew');
  });
});
