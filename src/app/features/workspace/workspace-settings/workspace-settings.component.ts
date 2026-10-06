import {
  afterNextRender,
  Component,
  computed,
  DOCUMENT,
  effect,
  inject,
  Injector,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SettingsSectionHeaderComponent } from '../../settings/settings-section-header/settings-section-header.component';
import {
  isInAppNavigation,
  returnSectionOf,
  returnStateOf,
} from '../../settings/settings-navigation';
import {
  WorkspaceSettingsNavComponent,
  WorkspaceSettingsNavLayout,
} from './workspace-settings-nav/workspace-settings-nav.component';
import { WorkspaceSettingsPanelComponent } from './workspace-settings-panel/workspace-settings-panel.component';
import {
  OWNER_SECTION,
  resolveWorkspaceSettingsSection,
  visibleWorkspaceSettingsSections,
  WORKSPACE_SETTINGS_URL,
  WorkspaceSettingsSection,
  workspaceSettingsRedirectOf,
  workspaceSettingsSectionOf,
} from './workspace-settings-sections';

@Component({
  selector: 'app-workspace-settings',
  imports: [
    RouterLink,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
    SettingsSectionHeaderComponent,
    WorkspaceSettingsNavComponent,
    WorkspaceSettingsPanelComponent,
  ],
  templateUrl: './workspace-settings.component.html',
  styleUrl: './workspace-settings.component.scss',
})
export class WorkspaceSettingsComponent {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly breakpoints = inject(BreakpointService);
  private readonly workspace = inject(WorkspaceState);

  readonly section = input<string | undefined>();

  private readonly header = viewChild(SettingsSectionHeaderComponent);
  private readonly nav = viewChild(WorkspaceSettingsNavComponent);
  private readonly arrivedInApp = isInAppNavigation(this.router);
  private readonly returnSection = workspaceSettingsSectionOf(returnSectionOf(this.router));

  protected readonly listUrl = WORKSPACE_SETTINGS_URL;
  protected readonly ownerSection = OWNER_SECTION;
  protected readonly returnState = returnStateOf;
  protected readonly isMobile = this.breakpoints.isMobile;
  protected readonly status = this.workspace.loadStatus;
  protected readonly sections = computed(() =>
    visibleWorkspaceSettingsSections((permission) => this.workspace.can(permission)),
  );
  protected readonly current = computed(() =>
    resolveWorkspaceSettingsSection(this.section(), this.isMobile()),
  );
  protected readonly showNav = computed(() => !this.isMobile() || !this.current());
  protected readonly navLayout = computed<WorkspaceSettingsNavLayout>(() => {
    if (this.breakpoints.isDesktop()) {
      return 'side';
    }
    return this.breakpoints.isTablet() ? 'chips' : 'list';
  });

  constructor() {
    effect(() => {
      const target = workspaceSettingsRedirectOf(this.section(), this.isMobile());
      if (target) {
        untracked(() => void this.router.navigateByUrl(target, { replaceUrl: true }));
      }
    });
    this.restoreFocusOnSectionChange();
  }

  protected retry(): void {
    void this.workspace.reload();
  }

  private restoreFocusOnSectionChange(): void {
    let firstRun = true;
    effect(() => {
      const section = this.current();
      const navigatedHere = !firstRun || this.arrivedInApp;
      firstRun = false;
      if (navigatedHere) {
        afterNextRender(() => this.focusAfterNavigation(section), { injector: this.injector });
      }
    });
  }

  private focusAfterNavigation(section: WorkspaceSettingsSection | null): void {
    const active = this.document.activeElement;
    const focusLost = !active || active === this.document.body || !active.isConnected;
    if (!focusLost) {
      return;
    }
    if (section) {
      this.header()?.focusTitle();
    } else if (this.returnSection) {
      this.nav()?.focusSection(this.returnSection.id);
    }
  }
}
