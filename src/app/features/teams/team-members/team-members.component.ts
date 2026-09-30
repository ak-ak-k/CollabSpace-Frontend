import { booleanAttribute, Component, computed, input, output, signal } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { StatusDotComponent } from '../../../shared/ui/status-dot/status-dot.component';
import { TableComponent } from '../../../shared/ui/table/table.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { TeamMemberView } from '../team-view';

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
  ],
  templateUrl: './team-members.component.html',
  styleUrl: './team-members.component.scss',
})
export class TeamMembersComponent {
  readonly members = input.required<readonly TeamMemberView[]>();
  readonly compact = input(false, { transform: booleanAttribute });

  readonly invite = output<void>();
  readonly message = output<string>();

  protected readonly query = signal('');
  protected readonly visibleMembers = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.members().filter(
      (member) => !query || `${member.name} ${member.title}`.toLowerCase().includes(query),
    );
  });
}
