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
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SettingsAccountComponent } from '../settings-account/settings-account.component';
import { SettingsAppearanceComponent } from '../settings-appearance/settings-appearance.component';
import { SettingsNavComponent } from '../settings-nav/settings-nav.component';
import { SettingsNotificationsComponent } from '../settings-notifications/settings-notifications.component';
import { SettingsPrivacyComponent } from '../settings-privacy/settings-privacy.component';
import { SettingsProfileComponent } from '../settings-profile/settings-profile.component';
import { SettingsSectionHeaderComponent } from '../settings-section-header/settings-section-header.component';
import { SettingsSecurityComponent } from '../settings-security/settings-security.component';
import {
  resolveSettingsSection,
  SETTINGS_URL,
  settingsRedirectOf,
  SettingsSection,
  settingsSectionOf,
} from '../settings-sections';
import { isInAppNavigation, returnSectionOf, returnStateOf } from '../settings-navigation';

@Component({
  selector: 'app-settings-page',
  imports: [
    RouterLink,
    IconComponent,
    SettingsNavComponent,
    SettingsSectionHeaderComponent,
    SettingsAccountComponent,
    SettingsProfileComponent,
    SettingsNotificationsComponent,
    SettingsAppearanceComponent,
    SettingsPrivacyComponent,
    SettingsSecurityComponent,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
})
export class SettingsPageComponent {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  readonly section = input<string>();

  private readonly header = viewChild(SettingsSectionHeaderComponent);
  private readonly nav = viewChild(SettingsNavComponent);
  private readonly arrivedInApp = isInAppNavigation(this.router);
  private readonly returnSection = settingsSectionOf(returnSectionOf(this.router));

  protected readonly listUrl = SETTINGS_URL;
  protected readonly isMobile = inject(BreakpointService).isMobile;
  protected readonly current = computed(() =>
    resolveSettingsSection(this.section(), this.isMobile()),
  );
  protected readonly showNav = computed(() => !this.isMobile() || !this.current());
  protected readonly navCurrent = computed(() =>
    this.isMobile() ? null : (this.current()?.id ?? null),
  );
  protected readonly returnState = returnStateOf;

  constructor() {
    effect(() => {
      const target = settingsRedirectOf(this.section(), this.isMobile());
      if (target) {
        untracked(() => void this.router.navigateByUrl(target, { replaceUrl: true }));
      }
    });
    this.restoreFocusOnSectionChange();
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

  private focusAfterNavigation(section: SettingsSection | null): void {
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
