import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import { FileChanges, FilesData, NewFile } from '../data/files.data';
import { CURRENT_USER_ID } from '../mocks/users.mock';
import {
  extensionOf,
  FileDraft,
  FileItem,
  fileTypeOf,
  TeamFileDraft,
  UPLOAD_SOURCE,
} from '../models/file-item';
import { canSeeFile, FileAccess } from '../models/file-source';
import { DataModeState } from './data-mode.state';
import { Loadable, settledStatus } from './loadable';
import { WorkspaceState } from './workspace.state';

type FilePlacement = Pick<NewFile, 'source' | 'teamId' | 'location' | 'shared' | 'taskIds'>;

const PRIVATE_LOCATION = 'Only you';
const QUICK_UPLOAD_SIZE: Pick<FileDraft, 'sizeLabel' | 'bytes'> = {
  sizeLabel: '1.2 MB',
  bytes: 1_200_000,
};

@Service()
export class FileState {
  private readonly data = inject(FilesData);
  private readonly dataMode = inject(DataModeState);
  private readonly workspace = inject(WorkspaceState);

  private readonly allFiles = signal<readonly FileItem[]>([]);

  private readonly loader = new Loadable<readonly FileItem[]>({
    fetch: () => this.data.getFiles(),
    store: (files) => this.allFiles.set(files),
    isEmpty: (files) => files.length === 0,
  });

  private readonly currentUserId = computed(
    () => this.workspace.currentUser()?.id ?? CURRENT_USER_ID,
  );
  private readonly access = computed<FileAccess>(() => {
    const channels = new Map(this.workspace.channels().map((channel) => [channel.id, channel]));
    const teams = new Map(this.workspace.teams().map((team) => [team.id, team]));
    return {
      currentUserId: this.currentUserId(),
      channel: (channelId) => channels.get(channelId) ?? null,
      team: (teamId) => teams.get(teamId) ?? null,
    };
  });

  readonly files = computed(() => {
    const access = this.access();
    return this.allFiles().filter(
      (file) => this.workspace.contains(file) && canSeeFile(file, access),
    );
  });
  readonly status = settledStatus(this.loader.status, () => this.files().length === 0);

  constructor() {
    effect(() => {
      this.dataMode.mode();
      untracked(() => void this.loader.load());
    });
  }

  reload(): Promise<void> {
    return this.loader.load();
  }

  filesAt(locations: ReadonlySet<string>): readonly FileItem[] {
    return this.files().filter((file) => locations.has(file.location));
  }

  file(id: string): FileItem | null {
    return this.files().find((file) => file.id === id) ?? null;
  }

  filesByIds(ids: readonly string[]): FileItem[] {
    const filesById = new Map(this.files().map((file) => [file.id, file]));
    return ids.map((id) => filesById.get(id)).filter((file) => file !== undefined);
  }

  filesForTask(taskId: string): FileItem[] {
    return this.files().filter((file) => file.taskIds.includes(taskId));
  }

  fileForAttachment(conversationId: string, name: string): FileItem | null {
    const named = this.files().filter((file) => file.name === name);
    const sharedHere = named.find(
      (file) => file.source.type === 'message' && file.source.conversationId === conversationId,
    );
    return sharedHere ?? named[0] ?? null;
  }

  toggleStar(id: string): void {
    const file = this.file(id);
    if (file) {
      this.change(id, { starred: !file.starred });
    }
  }

  rename(id: string, name: string): FileItem | null {
    const previous = this.file(id);
    if (previous) {
      this.change(id, { name, modifiedAt: Date.now() });
    }
    return previous;
  }

  remove(id: string): FileItem | null {
    const removed = this.file(id);
    if (removed) {
      this.allFiles.update((files) => files.filter((file) => file.id !== id));
      void this.data.deleteFile(id);
    }
    return removed;
  }

  restore(file: FileItem): void {
    this.allFiles.update((files) => [file, ...files.filter((current) => current.id !== file.id)]);
    void this.data.restoreFile(file);
  }

  upload(draft: string | TeamFileDraft): Promise<FileItem> {
    const upload = typeof draft === 'string' ? { name: draft, ...QUICK_UPLOAD_SIZE } : draft;
    const teamId = upload.teamId ?? null;
    const teamName = teamId ? this.workspace.team(teamId)?.name : null;
    return this.add(upload, {
      source: UPLOAD_SOURCE,
      teamId,
      location: teamName ?? PRIVATE_LOCATION,
      shared: !!teamName,
      taskIds: [],
    });
  }

  attachToTask(taskId: string, draft: TeamFileDraft): Promise<FileItem> {
    return this.add(draft, {
      source: { type: 'task', taskId },
      teamId: draft.teamId ?? null,
      location: taskId,
      shared: true,
      taskIds: [taskId],
    });
  }

  detachFromTask(fileId: string, taskId: string): void {
    const file = this.file(fileId);
    if (file?.taskIds.includes(taskId)) {
      this.change(fileId, { taskIds: file.taskIds.filter((id) => id !== taskId) });
    }
  }

  attachToMessage(
    conversationId: string,
    messageId: string | null,
    draft: FileDraft,
  ): Promise<FileItem> {
    const channel = this.workspace.channels().find(({ id }) => id === conversationId);
    return this.add(draft, {
      source: { type: 'message', conversationId, messageId },
      teamId: channel?.teamId ?? null,
      location: channel ? `#${channel.name}` : '',
      shared: true,
      taskIds: [],
    });
  }

  private async add(draft: FileDraft, placement: FilePlacement): Promise<FileItem> {
    const now = Date.now();
    const file = await this.data.addFile({
      workspaceId: this.workspace.currentWorkspaceId(),
      name: draft.name,
      extension: extensionOf(draft.name),
      type: draft.type ?? fileTypeOf(draft.name),
      sizeLabel: draft.sizeLabel,
      bytes: draft.bytes,
      ownerId: this.currentUserId(),
      uploadedAt: now,
      modifiedAt: now,
      starred: false,
      previewUrl: draft.previewUrl ?? null,
      ...placement,
    });
    this.allFiles.update((files) => [file, ...files]);
    return file;
  }

  private change(id: string, changes: FileChanges): void {
    this.allFiles.update((files) =>
      files.map((file) => (file.id === id ? { ...file, ...changes } : file)),
    );
    void this.data.updateFile(id, changes);
  }
}
