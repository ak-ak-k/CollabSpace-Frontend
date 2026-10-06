import { ActivityChange, ActivityEntry } from '../models/activity';
import { FileItem, filePreviewRouteOf } from '../models/file-item';

export type FileActivityVerb = 'uploaded' | 'renamed' | 'deleted' | 'restored';

const NO_ROUTE = '';

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
});
