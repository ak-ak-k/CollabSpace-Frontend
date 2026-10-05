import { TestBed } from '@angular/core/testing';
import { EMOJI_PALETTE } from '../../../../core/models/thread';
import { EmojiPickerComponent } from './emoji-picker.component';

describe('EmojiPickerComponent', () => {
  const render = async () => {
    const fixture = TestBed.createComponent(EmojiPickerComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, buttons: Array.from(host.querySelectorAll('button')) };
  };

  it('renders a labelled button for every emoji in the palette', async () => {
    const { host, buttons } = await render();

    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBe('Insert emoji');
    expect(buttons).toHaveLength(EMOJI_PALETTE.length);
    expect(buttons[0].getAttribute('aria-label')).toBe('Insert grinning face');
  });

  it('emits the picked emoji', async () => {
    const { fixture, buttons } = await render();
    const picked: string[] = [];
    fixture.componentInstance.pick.subscribe((emoji) => picked.push(emoji));

    buttons[2].click();

    expect(picked).toEqual([EMOJI_PALETTE[2]]);
  });
});
