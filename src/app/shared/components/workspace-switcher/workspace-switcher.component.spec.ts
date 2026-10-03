import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WorkspaceAccess, WorkspaceSummary } from '../../../core/models/workspace';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { WorkspaceActions } from '../../../features/workspace/workspace-actions.service';
import { WorkspaceSwitch } from '../../../layout/workspace-switch';
import { WorkspaceSwitcherComponent } from './workspace-switcher.component';

const summaryOf = (id: string, name: string, current: boolean): WorkspaceSummary => ({
  id,
  name,
  code: name.slice(0, 2).toUpperCase(),
  plan: current ? 'Business' : 'Free',
  slug: id,
  description: '',
  createdLabel: '',
  ownerId: 'u0',
  domain: '',
  logoUrl: null,
  archivedAt: null,
  deleteAt: null,
  memberCount: current ? 48 : 12,
  myRole: current ? 'owner' : 'admin',
  current,
});

const accessOf = (canInvite: boolean): WorkspaceAccess => ({
  myRole: 'owner',
  canManage: true,
  isOwner: true,
  canInvite,
  canCreateTeams: true,
});

describe('WorkspaceSwitcherComponent', () => {
  const northstar = summaryOf('w1', 'Northstar Labs', true);
  const orbit = summaryOf('w2', 'Orbit Studio', false);

  const render = async (canInvite = true) => {
    const switchTo = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: WorkspaceState,
          useValue: { summaries: signal([northstar, orbit]), access: signal(accessOf(canInvite)) },
        },
        { provide: WorkspaceSwitch, useValue: { switchTo } },
        {
          provide: WorkspaceActions,
          useValue: { openInvite: vi.fn(), openCreateWorkspace: vi.fn() },
        },
        { provide: BreakpointService, useValue: { isMobile: signal(false) } },
      ],
    });
    const fixture = TestBed.createComponent(WorkspaceSwitcherComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    return { element, switchTo };
  };

  it('describes the current workspace and lists every workspace as a radio item', async () => {
    const { element } = await render();
    const radios = [...element.querySelectorAll('[role="menuitemradio"]')];

    expect(element.querySelector('[role="menu"]')?.getAttribute('aria-label')).toBe(
      'Workspace menu',
    );
    expect(element.querySelector('.workspace-switcher__name')?.textContent).toBe('Northstar Labs');
    expect(element.querySelector('.workspace-switcher__meta')?.textContent).toBe(
      'Business plan · 48 members · You’re an Owner',
    );
    expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual(['true', 'false']);
    expect(radios[1]?.textContent).toContain('Admin · 12 members');
  });

  it('switches to the workspace that is picked', async () => {
    const { element, switchTo } = await render();
    const radios = element.querySelectorAll<HTMLElement>('[role="menuitemradio"]');

    radios[1]?.click();

    expect(switchTo).toHaveBeenCalledWith(orbit);
  });

  it('offers Invite people only to people who can invite', async () => {
    const { element } = await render(false);
    const labels = [...element.querySelectorAll('[role="menuitem"]')].map((item) =>
      item.textContent?.trim(),
    );

    expect(labels).not.toContain('Invite people');
    expect(labels).toContain('Create workspace');
  });
});
