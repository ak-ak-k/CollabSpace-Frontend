import { DialogRef } from '@angular/cdk/dialog';
import { CdkMenu } from '@angular/cdk/menu';
import { Component, computed, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceSummary } from '../../../core/models/workspace';
import { roleWithArticle, WORKSPACE_ROLE_LABELS } from '../../../core/models/workspace-role';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { WorkspaceActions } from '../../../features/workspace/workspace-actions.service';
import { WorkspaceSwitch } from '../../../layout/workspace-switch';
import { CountPipe, formatCount } from '../../pipes/count.pipe';
import { DropdownHeadingComponent } from '../../ui/dropdown/dropdown-heading/dropdown-heading.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { IconButtonComponent } from '../../ui/icon-button/icon-button.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { labelEnclosingDialog } from '../../ui/modal/dialog-container/dialog-label';
import { createOverlayId } from '../../ui/modal/overlay-id';

const MOBILE_SETTINGS_ROUTE = '/workspace/settings';
const SETTINGS_ROUTE = '/workspace/settings/general';
const FALLBACK_NAME = 'Workspace';

@Component({
  selector: 'app-workspace-switcher',
  imports: [
    CdkMenu,
    RouterLink,
    DropdownItemComponent,
    DropdownHeadingComponent,
    IconComponent,
    IconButtonComponent,
    CountPipe,
  ],
  templateUrl: './workspace-switcher.component.html',
  styleUrl: './workspace-switcher.component.scss',
  host: {
    '[class.workspace-switcher--sheet]': 'sheet',
    '[attr.role]': 'sheet ? null : "dialog"',
    '[attr.aria-labelledby]': 'sheet ? null : nameId',
  },
})
export class WorkspaceSwitcherComponent {
  private readonly sheetRef = inject(DialogRef, { optional: true });
  private readonly workspace = inject(WorkspaceState);
  private readonly switcher = inject(WorkspaceSwitch);
  private readonly actions = inject(WorkspaceActions);
  private readonly breakpoint = inject(BreakpointService);
  private readonly menu = viewChild.required(CdkMenu);

  protected readonly sheet = this.sheetRef !== null;
  protected readonly nameId = createOverlayId('workspace-switcher-name');
  protected readonly roleLabels = WORKSPACE_ROLE_LABELS;
  protected readonly workspaces = this.workspace.summaries;
  protected readonly current = computed(
    () => this.workspaces().find((workspace) => workspace.current) ?? null,
  );
  protected readonly currentName = computed(() => this.current()?.name ?? FALLBACK_NAME);
  protected readonly canInvite = computed(() => this.workspace.access().canInvite);
  protected readonly settingsRoute = computed(() =>
    this.breakpoint.isMobile() ? MOBILE_SETTINGS_ROUTE : SETTINGS_ROUTE,
  );
  protected readonly currentMeta = computed(() => {
    const current = this.current();
    return current
      ? `${current.plan} plan · ${formatCount(current.memberCount, 'member')} · You’re ${roleWithArticle(current.myRole)}`
      : '';
  });

  constructor() {
    labelEnclosingDialog(this.nameId);
  }

  protected focusFirstItem(): void {
    this.menu().focusFirstItem();
  }

  protected close(): void {
    this.sheetRef?.close();
  }

  protected pick(workspace: WorkspaceSummary): void {
    this.close();
    this.switcher.switchTo(workspace);
  }

  protected invite(): void {
    this.close();
    this.actions.openInvite();
  }

  protected createWorkspace(): void {
    this.close();
    this.actions.openCreateWorkspace();
  }
}
