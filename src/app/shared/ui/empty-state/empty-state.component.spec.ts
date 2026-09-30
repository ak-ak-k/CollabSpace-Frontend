import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;
  let host: HTMLElement;

  const render = async (inputs: Record<string, unknown>) => {
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    await fixture.whenStable();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyStateComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders the default empty copy as a status without an action', async () => {
    await render({});

    expect(host.getAttribute('role')).toBe('status');
    expect(host.querySelector('h2')?.textContent?.trim()).toBe('Nothing here yet');
    expect(host.querySelector('p')?.textContent?.trim()).toBe(
      'When there’s something to show, it’ll appear here.',
    );
    expect(host.querySelector('button')).toBeNull();
  });

  it('renders errors as an alert with the danger tile', async () => {
    await render({ kind: 'error' });

    expect(host.getAttribute('role')).toBe('alert');
    expect(host.classList.contains('empty-state--error')).toBe(true);
    expect(host.querySelector('h2')?.textContent?.trim()).toBe('Something went wrong');
  });

  it('reflects custom copy, heading level and compact spacing', async () => {
    await render({
      kind: 'offline',
      heading: 'No shared files',
      message: 'Files shared in this team’s channels will appear here.',
      headingLevel: 3,
      compact: true,
    });

    expect(host.querySelector('h3')?.textContent?.trim()).toBe('No shared files');
    expect(host.querySelector('h2')).toBeNull();
    expect(host.classList.contains('empty-state--compact')).toBe(true);
  });

  it('emits action when the button is clicked', async () => {
    let actionCount = 0;
    fixture.componentInstance.action.subscribe(() => (actionCount += 1));
    await render({ kind: 'error', actionLabel: 'Try again' });

    const button = host.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(button.textContent?.trim()).toBe('Try again');
    expect(actionCount).toBe(1);
  });
});
