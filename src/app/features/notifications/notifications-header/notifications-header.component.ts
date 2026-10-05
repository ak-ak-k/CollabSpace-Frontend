import { Component, ElementRef, input, model, output, viewChild } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { RadioGroupComponent, RadioOption } from '../../../shared/ui/radio/radio-group.component';

const SHOW_OPTIONS: readonly RadioOption[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
];

@Component({
  selector: 'app-notifications-header',
  imports: [ButtonComponent, IconComponent, RadioGroupComponent],
  templateUrl: './notifications-header.component.html',
  styleUrl: './notifications-header.component.scss',
})
export class NotificationsHeaderComponent {
  readonly summary = input.required<string>();
  readonly canMarkAllRead = input(false);
  readonly markAllLabel = input('Mark all as read');
  readonly show = model('all');
  readonly markAllRead = output<void>();

  protected readonly showOptions = SHOW_OPTIONS;

  private readonly title = viewChild.required<ElementRef<HTMLElement>>('title');

  focusTitle(): void {
    this.title().nativeElement.focus();
  }

  protected requestMarkAllRead(): void {
    if (this.canMarkAllRead()) {
      this.markAllRead.emit();
    }
  }
}
