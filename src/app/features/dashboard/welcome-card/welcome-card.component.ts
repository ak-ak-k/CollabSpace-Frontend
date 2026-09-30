import { Component, computed, ElementRef, input, output, viewChild } from '@angular/core';
import { LoadStatus } from '../../../core/models/load-status';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

const NOON_HOUR = 12;
const EVENING_HOUR = 17;

const greetingFor = (hour: number): string => {
  if (hour < NOON_HOUR) {
    return 'Good morning';
  }
  return hour < EVENING_HOUR ? 'Good afternoon' : 'Good evening';
};

const STATUS_SUMMARIES: Partial<Record<LoadStatus, string>> = {
  loading: 'Loading your workspace…',
  error: 'We couldn’t load everything. Try again from the sections below.',
  empty: 'Your workspace is ready. Invite your team and start your first conversation.',
};

const countOf = (count: number, singular: string): string =>
  `${count} ${singular}${count === 1 ? '' : 's'}`;

@Component({
  selector: 'app-dashboard-welcome-card',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './welcome-card.component.html',
  styleUrl: './welcome-card.component.scss',
})
export class WelcomeCardComponent {
  readonly firstName = input.required<string>();
  readonly unreadMentions = input(0);
  readonly tasksDueToday = input(0);
  readonly status = input<LoadStatus>('ready');

  readonly newMessage = output<void>();
  readonly newTask = output<void>();
  readonly invitePeople = output<void>();
  readonly filesChosen = output<readonly string[]>();

  private readonly filePicker = viewChild.required<ElementRef<HTMLInputElement>>('filePicker');
  private readonly openedAt = new Date();

  protected readonly today = this.openedAt.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  protected readonly greeting = computed(() => {
    const greeting = greetingFor(this.openedAt.getHours());
    return this.firstName() ? `${greeting}, ${this.firstName()}` : greeting;
  });
  protected readonly summary = computed(() => STATUS_SUMMARIES[this.status()] ?? this.summarise());

  protected chooseFiles(): void {
    this.filePicker().nativeElement.click();
  }

  protected announceChosenFiles(picker: HTMLInputElement): void {
    const names = Array.from(picker.files ?? []).map((file) => file.name);
    if (names.length > 0) {
      this.filesChosen.emit(names);
    }
    picker.value = '';
  }

  private summarise(): string {
    const mentions = this.unreadMentions()
      ? countOf(this.unreadMentions(), 'unread mention')
      : 'no unread mentions';
    const due = this.tasksDueToday()
      ? `${countOf(this.tasksDueToday(), 'task')} due today`
      : 'nothing due today';
    return `You have ${mentions} and ${due}.`;
  }
}
