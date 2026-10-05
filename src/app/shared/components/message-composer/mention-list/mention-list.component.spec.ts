import { TestBed } from '@angular/core/testing';
import { MentionCandidate } from '../../../../core/models/thread';
import { MentionListComponent } from './mention-list.component';

const CANDIDATES: readonly MentionCandidate[] = [
  {
    id: 'u2',
    kind: 'member',
    token: '@Rahul',
    name: 'Rahul Mehta',
    firstName: 'Rahul',
    title: 'Engineer',
    seed: 1,
  },
  {
    id: '@here',
    kind: 'special',
    token: '@here',
    name: '@here',
    firstName: 'here',
    title: 'Notify everyone who’s online here',
    seed: 0,
  },
];

describe('MentionListComponent', () => {
  const render = async (activeIndex: number, heading = 'People') => {
    const fixture = TestBed.createComponent(MentionListComponent);
    fixture.componentRef.setInput('listId', 'composer-mentions');
    fixture.componentRef.setInput('candidates', CANDIDATES);
    fixture.componentRef.setInput('activeIndex', activeIndex);
    fixture.componentRef.setInput('heading', heading);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, options: Array.from(host.querySelectorAll('[role="option"]')) };
  };

  it('renders a labelled listbox with a heading and one option per candidate', async () => {
    const { host, options } = await render(1);

    expect(host.getAttribute('role')).toBe('listbox');
    expect(host.getAttribute('aria-label')).toBe('Mention someone');
    expect(host.id).toBe('composer-mentions');
    expect(host.querySelector('.mention-list__header')?.textContent).toBe('People');
    expect(options.map((option) => option.id)).toEqual([
      'composer-mentions-option-0',
      'composer-mentions-option-1',
    ]);
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(options[1].querySelector('.mention-list__tile')?.textContent).toBe('@');
  });

  it('names the list for channels and emits the picked candidate on click', async () => {
    const { fixture, host, options } = await render(0, 'Channels');
    const picked: MentionCandidate[] = [];
    fixture.componentInstance.pick.subscribe((candidate) => picked.push(candidate));

    (options[1] as HTMLElement).click();

    expect(host.getAttribute('aria-label')).toBe('Mention a channel');
    expect(picked).toEqual([CANDIDATES[1]]);
  });
});
