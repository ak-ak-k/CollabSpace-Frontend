import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { StatusDotComponent } from '../../../shared/ui/status-dot/status-dot.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { TeamMemberMenuComponent } from '../team-member-menu/team-member-menu.component';
import { TeamMemberView } from '../team-member-view';

@Component({
  selector: 'app-team-members',
  imports: [
    AvatarComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconButtonComponent,
    IconComponent,
    SearchInputComponent,
    StatusDotComponent,
    TableComponent,
    TagComponent,
    TeamMemberMenuComponent,
  ],
  templateUrl: './team-members.component.html',
  styleUrl: './team-members.component.scss',
})
export class TeamMembersComponent {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly search = viewChild.required(SearchInputComponent);

  readonly teamId = input.required<string>();
  readonly members = input.required<readonly TeamMemberView[]>();
  readonly compact = input(false, { transform: booleanAttribute });
  readonly canInvite = input(false, { transform: booleanAttribute });

  readonly addMembers = output<void>();
  readonly inviteByEmail = output<void>();
  readonly message = output<string>();

  protected readonly query = signal('');
  protected readonly visibleMembers = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.members().filter(
      (member) => !query || `${member.name} ${member.title}`.toLowerCase().includes(query),
    );
  });

  constructor() {
    let previousCount = 0;
    effect(() => {
      const count = this.members().length;
      if (count < previousCount) {
        afterNextRender(() => this.recoverLostFocus(), { injector: this.injector });
      }
      previousCount = count;
    });
  }

  private recoverLostFocus(): void {
    const active = this.document.activeElement;
    if (!active || active === this.document.body || !active.isConnected) {
      this.search().focus();
    }
  }
}
