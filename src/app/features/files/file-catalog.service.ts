import { computed, inject, Service } from '@angular/core';
import { CURRENT_USER_ID } from '../../core/mocks/users.mock';
import { Conversation } from '../../core/models/conversation';
import { FileItem } from '../../core/models/file-item';
import {
  conversationReference,
  FileSourceInfo,
  FileSourceLookup,
  referencesOf,
} from '../../core/models/file-source';
import { ChatState } from '../../core/state/chat.state';
import { FileState } from '../../core/state/file.state';
import { TaskState } from '../../core/state/task.state';
import { WorkspaceState } from '../../core/state/workspace.state';
import { FileRow, FileRowContext, toFileRow } from './files-view';

const UNKNOWN_PERSON = 'someone';

@Service()
export class FileCatalog {
  private readonly fileState = inject(FileState);
  private readonly workspace = inject(WorkspaceState);
  private readonly chat = inject(ChatState);
  private readonly tasks = inject(TaskState);

  readonly status = this.fileState.status;

  private readonly currentUserId = computed(
    () => this.workspace.currentUser()?.id ?? CURRENT_USER_ID,
  );
  private readonly conversationsById = computed(
    () => new Map(this.chat.conversations().map((conversation) => [conversation.id, conversation])),
  );

  readonly lookup = computed<FileSourceLookup>(() => {
    const conversations = this.conversationsById();
    const messages = this.chat.messages();
    const users = this.workspace.usersById();
    const teams = new Map(this.workspace.teams().map((team) => [team.id, team]));
    const tasks = new Map(this.tasks.tasks().map((task) => [task.id, task]));
    return {
      conversation: (conversationId) => conversations.get(conversationId) ?? null,
      userName: (userId) => users.get(userId)?.name ?? UNKNOWN_PERSON,
      teamName: (teamId) => teams.get(teamId)?.name ?? null,
      taskTitle: (taskId) => tasks.get(taskId)?.title ?? null,
      hasMessage: (conversationId, messageId) =>
        (messages[conversationId] ?? []).some(
          (message) => message.id === messageId && !message.threadRootId,
        ),
    };
  });

  readonly files = computed(() =>
    this.fileState.files().filter((file) => this.visibleInGroup(file)),
  );

  private readonly rowContext = computed<FileRowContext>(() => {
    const access = this.workspace.access();
    return {
      usersById: this.workspace.usersById(),
      currentUserId: this.currentUserId(),
      isAdmin: access.canManage,
      isGuest: access.myRole === 'guest',
      lookup: this.lookup(),
      now: Date.now(),
    };
  });

  readonly rows = computed<readonly FileRow[]>(() => {
    const context = this.rowContext();
    return this.files().map((file) => toFileRow(file, context));
  });

  private readonly rowsById = computed(() => new Map(this.rows().map((row) => [row.id, row])));

  reload(): Promise<void> {
    return this.fileState.reload();
  }

  row(id: string): FileRow | null {
    return this.rowsById().get(id) ?? null;
  }

  file(id: string): FileItem | null {
    return this.files().find((file) => file.id === id) ?? null;
  }

  referencesOf(fileId: string): readonly FileSourceInfo[] {
    const file = this.file(fileId);
    if (!file) {
      return [];
    }
    const sharedIn = Object.entries(this.chat.messages())
      .filter(([conversationId, messages]) =>
        messages.some((message) =>
          message.attachments.some(
            (attachment) =>
              attachment.name === file.name &&
              this.fileState.fileForAttachment(conversationId, attachment.name)?.id === file.id,
          ),
        ),
      )
      .map(([conversationId]) => conversationId);
    return referencesOf(file, this.lookup(), sharedIn);
  }

  conversationTitle(conversationId: string): string {
    const conversation = this.conversationsById().get(conversationId);
    return conversation ? conversationReference(conversation, this.lookup()).label : 'conversation';
  }

  teamChannelIds(teamId: string): ReadonlySet<string> {
    return new Set(this.workspace.team(teamId)?.channelIds ?? []);
  }

  private visibleInGroup(file: FileItem): boolean {
    if (file.source.type !== 'message') {
      return true;
    }
    const conversation: Conversation | undefined = this.conversationsById().get(
      file.source.conversationId,
    );
    return conversation?.type !== 'group' || conversation.memberIds.includes(this.currentUserId());
  }
}
