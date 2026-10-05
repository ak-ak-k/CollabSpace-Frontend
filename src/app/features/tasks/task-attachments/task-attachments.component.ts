import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FILE_TYPE_ICONS, FileItem, fileTypeOf } from '../../../core/models/file-item';
import { Task } from '../../../core/models/task';
import { firstNameOf } from '../../../core/models/user';
import { ToastService } from '../../../core/services/toast.service';
import { FileState } from '../../../core/state/file.state';
import { TaskState } from '../../../core/state/task.state';
import { WorkspaceState } from '../../../core/state/workspace.state';
import { formatFileSize } from '../../../shared/pipes/file-size.pipe';
import { formatRelative } from '../../../shared/pipes/time-format';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icon-registry';
import { createUniqueId } from '../../../shared/ui/input/field/unique-id';

interface AttachmentRow {
  readonly file: FileItem;
  readonly icon: IconName;
  readonly meta: string;
}

const FILE_PREVIEW_PATH = '/files/recent';
const SEPARATOR = ' · ';

@Component({
  selector: 'app-task-attachments',
  imports: [ButtonComponent, IconButtonComponent, IconComponent, RouterLink],
  templateUrl: './task-attachments.component.html',
  styleUrl: './task-attachments.component.scss',
})
export class TaskAttachmentsComponent {
  private readonly files = inject(FileState);
  private readonly tasks = inject(TaskState);
  private readonly workspace = inject(WorkspaceState);
  private readonly toasts = inject(ToastService);

  readonly task = input.required<Task>();

  protected readonly headingId = createUniqueId('task-attachments');
  protected readonly previewPath = FILE_PREVIEW_PATH;
  protected readonly rows = computed<readonly AttachmentRow[]>(() =>
    this.files.filesForTask(this.task().id).map((file) => ({
      file,
      icon: FILE_TYPE_ICONS[file.type],
      meta: [file.sizeLabel, this.ownerName(file.ownerId), formatRelative(file.modifiedAt)].join(
        SEPARATOR,
      ),
    })),
  );

  protected async attach(picker: HTMLInputElement): Promise<void> {
    const picked = [...(picker.files ?? [])];
    picker.value = '';
    const task = this.task();
    if (picked.length === 0) {
      return;
    }
    await Promise.all(
      picked.map((file) =>
        this.files.attachToTask(task.id, {
          name: file.name,
          sizeLabel: formatFileSize(file.size),
          bytes: file.size,
          type: fileTypeOf(file.name),
          teamId: task.teamId,
        }),
      ),
    );
    this.tasks.markPendingWhileOffline(task.id);
    const what = picked.length === 1 ? picked[0].name : `${picked.length} files`;
    this.toasts.show(`${what} attached — also saved to Files`, { icon: 'paperclip' });
  }

  protected detach(file: FileItem): void {
    const taskId = this.task().id;
    this.files.detachFromTask(file.id, taskId);
    this.tasks.markPendingWhileOffline(taskId);
    this.toasts.show(`${file.name} removed from ${taskId} — it’s still in Files`, {
      icon: 'paperclip',
    });
  }

  private ownerName(userId: string): string {
    const user = this.workspace.user(userId);
    return user ? firstNameOf(user.name) : '';
  }
}
