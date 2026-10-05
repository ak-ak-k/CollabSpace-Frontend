import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, computed, inject, input, signal } from '@angular/core';
import { DROPDOWN_IMPORTS } from '../../../shared/ui/dropdown/dropdown-imports';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { TeamMemberActions } from '../team-member-actions.service';
import { TeamMemberActionKind, TeamMemberView } from '../team-member-view';

export type TeamMemberMenuVariant = 'popover' | 'sheet';

const MENU_BELOW_END: ConnectedPosition = {
  originX: 'end',
  originY: 'bottom',
  overlayX: 'end',
  overlayY: 'top',
};
const MENU_ABOVE_END: ConnectedPosition = {
  originX: 'end',
  originY: 'top',
  overlayX: 'end',
  overlayY: 'bottom',
};

@Component({
  selector: 'app-team-member-menu',
  imports: [DROPDOWN_IMPORTS, IconButtonComponent, IconComponent],
  templateUrl: './team-member-menu.component.html',
  styleUrl: './team-member-menu.component.scss',
})
export class TeamMemberMenuComponent {
  private readonly actions = inject(TeamMemberActions);

  readonly teamId = input.required<string>();
  readonly member = input.required<TeamMemberView>();
  readonly variant = input<TeamMemberMenuVariant>('popover');

  protected readonly positions = [MENU_BELOW_END, MENU_ABOVE_END];
  protected readonly triggerLabel = computed(() => `More actions for ${this.member().name}`);
  protected readonly menuLabel = computed(() => `Actions for ${this.member().name}`);
  protected readonly items = computed(() => this.actions.menuItems(this.teamId(), this.member()));
  protected readonly sheetOpen = signal(false);

  protected run(kind: TeamMemberActionKind): void {
    this.actions.run(kind, this.teamId(), this.member());
  }

  protected openSheet(): void {
    this.sheetOpen.set(true);
    this.actions
      .openSheet(this.teamId(), this.member())
      .closed.subscribe(() => this.sheetOpen.set(false));
  }
}
