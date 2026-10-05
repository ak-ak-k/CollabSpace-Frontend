import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { CURRENT_USER_ID } from '../../../core/mocks/users.mock';
import { TaskComment } from '../../../core/models/task';
import { userColorSeed } from '../../../core/models/user';
import { DialogService } from '../../../core/services/dialog.service';
import { TaskCommentState } from '../../../core/state/task-comment.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { formatRelative } from '../../../shared/pipes/time-format';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';

export interface CommentSegment {
  readonly text: string;
  readonly mention: boolean;
}

const MENTION_PATTERN = /(@[A-Z][a-z]+)/g;
const MENTION_TEST = /^@[A-Z]/;

export const commentSegmentsOf = (text: string): CommentSegment[] =>
  text
    .split(MENTION_PATTERN)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, mention: MENTION_TEST.test(part) }));

@Component({
  selector: 'app-task-comment',
  imports: [AvatarComponent, ButtonComponent, TextareaComponent],
  templateUrl: './task-comment.component.html',
  styleUrl: './task-comment.component.scss',
})
export class TaskCommentComponent {
  private readonly comments = inject(TaskCommentState);
  private readonly workspace = inject(WorkspaceState);
  private readonly dialogs = inject(DialogService);
  private readonly injector = inject(Injector);
  private readonly editor = viewChild(TextareaComponent);
  private readonly editButton = viewChild<string, ElementRef<HTMLElement>>('editButton', {
    read: ElementRef,
  });

  readonly comment = input.required<TaskComment>();

  protected readonly editing = signal(false);
  protected readonly draft = signal('');
  protected readonly authorName = computed(
    () => this.workspace.user(this.comment().authorId)?.name ?? 'Someone',
  );
  protected readonly seed = computed(() => userColorSeed(this.comment().authorId));
  protected readonly when = computed(() => formatRelative(this.comment().createdAt));
  protected readonly mine = computed(() => this.comment().authorId === CURRENT_USER_ID);
  protected readonly segments = computed(() => commentSegmentsOf(this.comment().text));

  protected startEdit(): void {
    this.draft.set(this.comment().text);
    this.editing.set(true);
    afterNextRender(() => this.editor()?.focus(), { injector: this.injector });
  }

  protected cancelEdit(event?: Event): void {
    event?.stopPropagation();
    this.finishEdit();
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.comments.edit(this.comment().id, this.draft());
    this.finishEdit();
  }

  private finishEdit(): void {
    this.editing.set(false);
    afterNextRender(() => this.editButton()?.nativeElement.focus(), { injector: this.injector });
  }

  protected async remove(): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      title: 'Delete this comment?',
      body: `It will be removed from ${this.comment().taskId} for everyone.`,
      confirmLabel: 'Delete comment',
      icon: 'trash-2',
    });
    if (confirmed) {
      this.comments.remove(this.comment().id);
    }
  }
}
