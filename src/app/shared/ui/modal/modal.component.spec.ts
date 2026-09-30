import { DialogRef } from '@angular/cdk/dialog';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalComponent, ModalSize } from './modal.component';

@Component({
  imports: [ModalComponent],
  template: `
    <app-modal heading="Invite people" [description]="description()" [size]="size()">
      <p class="body">Body content</p>
      <button modalActions type="button">Send invites</button>
    </app-modal>
  `,
})
class ModalHostComponent {
  readonly description = signal('They will get an email with a link.');
  readonly size = signal<ModalSize | undefined>(undefined);
}

describe('ModalComponent', () => {
  const close = vi.fn();

  const render = async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: DialogRef, useValue: { close } }],
    });
    const fixture = TestBed.createComponent(ModalHostComponent);
    await fixture.whenStable();
    const modal = (fixture.nativeElement as HTMLElement).querySelector('app-modal') as HTMLElement;
    return { fixture, modal };
  };

  beforeEach(() => close.mockClear());

  it('renders the heading, description and projected content', async () => {
    const { modal } = await render();
    const title = modal.querySelector('h2') as HTMLElement;

    expect(title.textContent?.trim()).toBe('Invite people');
    expect(title.id).toMatch(/^modal-title-\d+$/);
    expect(modal.querySelector('.modal__description')?.textContent?.trim()).toBe(
      'They will get an email with a link.',
    );
    expect(modal.querySelector('.modal__body .body')).not.toBeNull();
    expect(modal.querySelector('.modal__actions button')?.textContent).toBe('Send invites');
  });

  it('reflects the size and hides an empty description', async () => {
    const { fixture, modal } = await render();

    fixture.componentInstance.size.set('lg');
    fixture.componentInstance.description.set('');
    await fixture.whenStable();

    expect(modal.classList.contains('modal--lg')).toBe(true);
    expect(modal.querySelector('.modal__description')).toBeNull();
  });

  it('closes the enclosing dialog from the close button', async () => {
    const { modal } = await render();

    modal.querySelector<HTMLButtonElement>('button[aria-label="Close dialog"]')?.click();

    expect(close).toHaveBeenCalledTimes(1);
  });
});
