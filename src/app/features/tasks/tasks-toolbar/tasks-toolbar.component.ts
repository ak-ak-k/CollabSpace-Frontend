import {
  booleanAttribute,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { isTaskSort, SORT_LABELS, TaskLayout, TaskSort } from '../tasks-filters';
import { TaskPerson } from '../tasks-view';

const LAYOUT_OPTIONS: readonly RadioOption[] = [
  { value: 'board', label: 'Board', icon: 'square-kanban' },
  { value: 'list', label: 'List', icon: 'list' },
];

const SORT_OPTIONS: readonly SelectOption[] = Object.entries(SORT_LABELS).map(([value, label]) => ({
  value,
  label,
}));

@Component({
  selector: 'app-tasks-toolbar',
  imports: [
    AvatarComponent,
    ButtonComponent,
    IconComponent,
    RadioGroupComponent,
    SearchInputComponent,
    SelectComponent,
  ],
  templateUrl: './tasks-toolbar.component.html',
  styleUrl: './tasks-toolbar.component.scss',
})
export class TasksToolbarComponent {
  readonly query = model('');
  readonly assigneeIds = model<readonly string[]>([]);
  readonly sort = model<TaskSort>('due');
  readonly people = input<readonly TaskPerson[]>([]);
  readonly showPeople = input(true, { transform: booleanAttribute });
  readonly layout = input<TaskLayout>('board');
  readonly filterLabel = input('Filters');
  readonly filtersOpen = input(false, { transform: booleanAttribute });
  readonly countLabel = input('');

  readonly layoutChange = output<TaskLayout>();
  readonly openFilters = output<HTMLElement>();

  private readonly filtersButton = viewChild.required<string, ElementRef<HTMLElement>>(
    'filtersButton',
    { read: ElementRef },
  );

  protected readonly layoutOptions = LAYOUT_OPTIONS;
  protected readonly sortOptions = SORT_OPTIONS;

  protected toggleAssignee(userId: string): void {
    this.assigneeIds.update((ids) =>
      ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId],
    );
  }

  protected requestFilters(): void {
    this.openFilters.emit(this.filtersButton().nativeElement);
  }

  protected changeLayout(value: string): void {
    this.layoutChange.emit(value === 'list' ? 'list' : 'board');
  }

  protected changeSort(value: string): void {
    if (isTaskSort(value)) {
      this.sort.set(value);
    }
  }
}
