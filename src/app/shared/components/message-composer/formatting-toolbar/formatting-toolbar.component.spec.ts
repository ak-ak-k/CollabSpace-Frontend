import { TestBed } from '@angular/core/testing';
import { FormatMark } from '../composer-format';
import { FormattingToolbarComponent } from './formatting-toolbar.component';

describe('FormattingToolbarComponent', () => {
  it('renders a labelled toolbar with the shortcut hint and emits the chosen format', async () => {
    const fixture = TestBed.createComponent(FormattingToolbarComponent);
    const picked: FormatMark[] = [];
    fixture.componentInstance.format.subscribe((mark) => picked.push(mark));
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(host.querySelectorAll('button'));

    expect(host.getAttribute('role')).toBe('toolbar');
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Bold (Ctrl+B)',
      'Italic (Ctrl+I)',
      'Code (Ctrl+E)',
      'Link',
    ]);
    expect(host.textContent).toContain('**bold** · _italic_ · `code`');

    buttons[1].click();
    expect(picked).toEqual(['italic']);
  });
});
