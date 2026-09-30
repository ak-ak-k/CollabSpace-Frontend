import { TestBed } from '@angular/core/testing';
import { MentionCandidate } from '../../../../core/models/thread';
import { MentionListComponent } from './mention-list.component';

const CANDIDATES: readonly MentionCandidate[] = [
  { id: 'u2', name: 'Rahul Mehta', firstName: 'Rahul', title: 'Engineer', seed: 1 },
  { id: 'u3', name: 'Ananya Singh', firstName: 'Ananya', title: 'Designer', seed: 2 },
];

describe('MentionListComponent', () => {
  const render = async (activeIndex: number) => {
    const fixture = TestBed.createComponent(MentionListComponent);
    fixture.componentRef.setInput('listId', 'composer-mentions');
    fixture.componentRef.setInput('candidates', CANDIDATES);
    fixture.componentRef.setInput('activeIndex', activeIndex);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, options: Array.from(host.querySelectorAll('[role="option"]')) };
  };

  it('renders a labelled listbox with one option per candidate', async () => {
    const { host, options } = await render(1);

    expect(host.getAttribute('role')).toBe('listbox');
    expect(host.id).toBe('composer-mentions');
    expect(options.map((option) => option.id)).toEqual([
      'composer-mentions-option-0',
      'composer-mentions-option-1',
    ]);
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(options[0].getAttribute('aria-selected')).toBe('false');
  });

  it('emits the picked candidate on click', async () => {
    const { fixture, options } = await render(0);
    const picked: MentionCandidate[] = [];
    fixture.componentInstance.pick.subscribe((candidate) => picked.push(candidate));

    (options[1] as HTMLElement).click();

    expect(picked).toEqual([CANDIDATES[1]]);
  });
});
