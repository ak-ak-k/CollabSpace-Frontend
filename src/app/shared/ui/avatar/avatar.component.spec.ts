import { TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  const render = async (inputs: Record<string, unknown>) => {
    const fixture = TestBed.createComponent(AvatarComponent);
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('shows initials and a stable tone for the seed', async () => {
    const host = await render({ name: 'Rahul Mehta', seed: 1 });

    expect(host.textContent?.trim()).toBe('RM');
    expect(host.classList.contains('avatar--tone-1')).toBe(true);
    expect(host.classList.contains('avatar--40')).toBe(true);
  });

  it('renders a presence dot only when a status is given', async () => {
    const withoutStatus = await render({ name: 'Priya Sharma' });
    const withStatus = await render({ name: 'Priya Sharma', status: 'away', size: 72 });

    expect(withoutStatus.querySelector('app-status-dot')).toBeNull();
    expect(withStatus.querySelector('app-status-dot')?.classList.contains('status-dot--away')).toBe(
      true,
    );
    expect(withStatus.classList.contains('avatar--dot-lg')).toBe(true);
  });

  it('supports the inverted tile with custom text', async () => {
    const host = await render({ name: 'Frontend', variant: 'inverted', text: 'FE', size: 32 });

    expect(host.textContent?.trim()).toBe('FE');
    expect(host.classList.contains('avatar--inverted')).toBe(true);
  });
});
