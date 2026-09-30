import { Component, computed, ElementRef, input, model, signal, viewChild } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { PRESENCE_LABELS, User, userColorSeed } from '../../../../core/models/user';
import { AvatarComponent } from '../../../../shared/ui/avatar/avatar.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { FieldErrorComponent } from '../../../../shared/ui/input/field-error/field-error.component';
import { FieldControl } from '../../../../shared/ui/input/field/field-control';
import { SearchInputComponent } from '../../../../shared/ui/search-input/search-input.component';

interface PersonOption {
  readonly user: User;
  readonly seed: number;
  readonly detail: string;
  readonly checked: boolean;
}

@Component({
  selector: 'app-member-picker',
  imports: [AvatarComponent, IconComponent, FieldErrorComponent, SearchInputComponent],
  templateUrl: './member-picker.component.html',
  styleUrl: './member-picker.component.scss',
})
export class MemberPickerComponent extends FieldControl implements FormValueControl<string[]> {
  readonly value = model<string[]>([]);
  readonly people = input.required<readonly User[]>();
  readonly label = input('Members');

  protected readonly query = signal('');
  protected readonly countLabel = computed(() =>
    this.value().length ? `${this.value().length} selected` : 'None selected',
  );
  protected readonly options = computed<readonly PersonOption[]>(() => {
    const query = this.query().trim().toLowerCase();
    const selected = new Set(this.value());
    return this.people()
      .filter((user) => !query || `${user.name} ${user.title}`.toLowerCase().includes(query))
      .map((user) => ({
        user,
        seed: userColorSeed(user.id),
        detail: `${user.title} · ${PRESENCE_LABELS[user.status]}`,
        checked: selected.has(user.id),
      }));
  });

  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');

  focus(options?: FocusOptions): void {
    this.list().nativeElement.querySelector('input')?.focus(options);
  }

  protected toggle(userId: string): void {
    this.value.update((ids) =>
      ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId],
    );
    this.touch.emit();
  }
}
