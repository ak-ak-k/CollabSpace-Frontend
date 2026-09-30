import { TestBed } from '@angular/core/testing';
import { Attachment } from '../../../../core/models/message';
import { AttachmentChipsComponent } from './attachment-chips.component';

const ATTACHMENTS: readonly Attachment[] = [
  { kind: 'file', type: 'pdf', name: 'Roadmap.pdf', size: '1.2 MB' },
  { kind: 'image', type: 'image', name: 'mock.png', size: '340 KB' },
];

describe('AttachmentChipsComponent', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(AttachmentChipsComponent);
    fixture.componentRef.setInput('attachments', ATTACHMENTS);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, removeButtons: Array.from(host.querySelectorAll('button')) };
  };

  it('renders a chip with name, size and a labelled remove button per attachment', async () => {
    const { host, removeButtons } = await render();

    expect(host.querySelectorAll('.attachment-chip')).toHaveLength(2);
    expect(host.textContent).toContain('Roadmap.pdf');
    expect(host.textContent).toContain('340 KB');
    expect(removeButtons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Remove Roadmap.pdf',
      'Remove mock.png',
    ]);
  });

  it('emits the index of the chip being removed', async () => {
    const { fixture, removeButtons } = await render();
    const removed: number[] = [];
    fixture.componentInstance.remove.subscribe((index) => removed.push(index));

    removeButtons[1].click();

    expect(removed).toEqual([1]);
  });
});
