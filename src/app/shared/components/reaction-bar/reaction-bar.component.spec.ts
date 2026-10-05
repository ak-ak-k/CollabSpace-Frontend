import { TestBed } from '@angular/core/testing';
import { ReactionView } from '../../../core/models/thread';
import { ReactionBarComponent } from './reaction-bar.component';

const REACTIONS: readonly ReactionView[] = [
  { emoji: '👍', count: 2, mine: true, description: 'You, Rahul reacted with 👍' },
  { emoji: '🎉', count: 1, mine: false, description: 'Priya reacted with 🎉' },
];

describe('ReactionBarComponent', () => {
  const render = async (reactions: readonly ReactionView[], showAdd: boolean) => {
    const fixture = TestBed.createComponent(ReactionBarComponent);
    fixture.componentRef.setInput('reactions', reactions);
    fixture.componentRef.setInput('showAdd', showAdd);
    await fixture.whenStable();
    return fixture;
  };

  it('renders a pressed chip for the current user’s reaction', async () => {
    const fixture = await render(REACTIONS, false);
    const chips = (fixture.nativeElement as HTMLElement).querySelectorAll('.reaction-bar__chip');

    expect(chips.length).toBe(2);
    expect(chips[0].getAttribute('aria-pressed')).toBe('true');
    expect(chips[0].getAttribute('aria-label')).toBe('You, Rahul reacted with 👍');
    expect(chips[0].classList.contains('reaction-bar__chip--mine')).toBe(true);
    expect(chips[1].getAttribute('aria-pressed')).toBe('false');
    expect(fixture.nativeElement.querySelector('.reaction-bar__add')).toBeNull();
  });

  it('emits the emoji when a chip is toggled and add when the add button is pressed', async () => {
    const fixture = await render(REACTIONS, true);
    const host = fixture.nativeElement as HTMLElement;
    const toggled: string[] = [];
    let added = false;
    fixture.componentInstance.toggle.subscribe((emoji) => toggled.push(emoji));
    fixture.componentInstance.add.subscribe(() => (added = true));

    host.querySelectorAll<HTMLButtonElement>('.reaction-bar__chip')[1].click();
    host.querySelector<HTMLButtonElement>('[aria-label="Add reaction"]')?.click();

    expect(toggled).toEqual(['🎉']);
    expect(added).toBe(true);
  });

  it('lists who reacted on right-click or long-press instead of toggling', async () => {
    const fixture = await render(REACTIONS, false);
    const host = fixture.nativeElement as HTMLElement;
    const shown: string[] = [];
    const toggled: string[] = [];
    fixture.componentInstance.reactorsShown.subscribe((who) => shown.push(who));
    fixture.componentInstance.toggle.subscribe((emoji) => toggled.push(emoji));

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    host.querySelector('.reaction-bar__chip')?.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(shown).toEqual(['You, Rahul reacted with 👍']);
    expect(toggled).toEqual([]);
  });
});
