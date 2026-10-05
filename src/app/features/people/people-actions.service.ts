import { DialogRef } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '../../core/services/dialog.service';
import { PersonActions } from '../../shared/components/person-panel/person-actions.service';
import { PersonPanelService } from '../../shared/components/person-panel/person-panel.service';
import { IconName } from '../../shared/ui/icon/icon-registry';
import {
  PeopleFiltersSheetComponent,
  PeopleFiltersSheetData,
} from './people-filters-sheet/people-filters-sheet.component';
import { PersonRow } from './people-page-view';
import {
  PersonActionsSheetComponent,
  PersonActionsSheetData,
} from './person-actions-sheet/person-actions-sheet.component';

export type PersonMenuKind = 'profile' | 'message' | 'team' | 'copy';

export interface PersonMenuItem {
  readonly id: string;
  readonly kind: PersonMenuKind;
  readonly label: string;
  readonly icon: IconName;
  readonly teamId?: string;
}

const MENU_TEAM_LIMIT = 2;

@Service()
export class PeopleActions {
  private readonly dialogs = inject(DialogService);
  private readonly personPanel = inject(PersonPanelService);
  private readonly people = inject(PersonActions);
  private readonly router = inject(Router);

  menuItems(row: PersonRow): readonly PersonMenuItem[] {
    const message: readonly PersonMenuItem[] = row.isMe
      ? []
      : [
          {
            id: 'message',
            kind: 'message',
            label: `Message ${row.firstName}`,
            icon: 'message-square',
          },
        ];
    const teams = row.teams.slice(0, MENU_TEAM_LIMIT).map((team): PersonMenuItem => ({
      id: `team-${team.id}`,
      kind: 'team',
      label: `View ${team.name} team`,
      icon: 'users',
      teamId: team.id,
    }));
    return [
      { id: 'profile', kind: 'profile', label: 'View profile', icon: 'user' },
      ...message,
      ...teams,
      { id: 'copy', kind: 'copy', label: 'Copy email', icon: 'copy' },
    ];
  }

  run(item: PersonMenuItem, row: PersonRow): void {
    switch (item.kind) {
      case 'profile':
        this.openProfile(row.id);
        break;
      case 'message':
        void this.message(row.id);
        break;
      case 'team':
        void this.router.navigate(['/teams', item.teamId]);
        break;
      default:
        this.people.copyEmail(row.email);
    }
  }

  openProfile(userId: string): void {
    this.personPanel.open(userId);
  }

  message(userId: string): Promise<void> {
    return this.people.message(userId);
  }

  openSheet(row: PersonRow): DialogRef<PersonMenuItem> {
    const sheet = this.dialogs.openDrawer<PersonMenuItem, PersonActionsSheetData>(
      PersonActionsSheetComponent,
      {
        data: { person: row, items: this.menuItems(row) },
        side: 'bottom',
        ariaLabel: `Actions for ${row.name}`,
      },
    );
    sheet.closed.subscribe((item) => item && this.run(item, row));
    return sheet;
  }

  openFilters(data: PeopleFiltersSheetData): DialogRef<void> {
    return this.dialogs.openDrawer<void, PeopleFiltersSheetData>(PeopleFiltersSheetComponent, {
      data,
      side: 'bottom',
    });
  }
}
