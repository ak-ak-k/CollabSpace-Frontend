import { ActivityChange, ActivityEntry } from '../models/activity';
import { FileActivityAction } from '../models/activity-action';
import { FileItem, filePreviewRouteOf } from '../models/file-item';

export type FileActivityVerb = 'uploaded' | 'renamed' | 'deleted' | 'restored';

const NO_ROUTE = '';

const FILE_ACTIONS: Record<FileActivityVerb, FileActivityAction> = {
  uploaded: 'file.uploaded',
  renamed: 'file.renamed',
  deleted: 'file.deleted',
  restored: 'file.restored',
};

export const fileActivityEntry = (
  verb: FileActivityVerb,
  file: FileItem,
  change: ActivityChange | null = null,
): ActivityEntry => ({
  kind: 'file',
  verb,
  object: file.name,
  route: verb === 'deleted' ? NO_ROUTE : filePreviewRouteOf(file.id),
  entity: { type: 'file', id: file.id },
  teamId: file.teamId,
  change,
  action: FILE_ACTIONS[verb],
});

export const fileAttachedEntry = (file: FileItem, taskId: string): ActivityEntry => ({
  kind: 'file',
  verb: 'attached',
  object: `${file.name} to ${taskId}`,
  route: filePreviewRouteOf(file.id),
  entity: { type: 'file', id: file.id },
  teamId: file.teamId,
  action: 'file.attached',
});
