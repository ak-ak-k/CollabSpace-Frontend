import {
  DayRow,
  MessageRow,
  ThreadParticipant,
  ThreadPreview,
  ThreadRow,
  ThreadSummary,
} from '../models/thread';
import { User, userColorSeed } from '../models/user';

const REPLIES_SEPARATOR_KEY = 'thread-replies';
const NO_REPLIES_LABEL = 'No replies yet';

export const replyCountLabel = (count: number): string =>
  `${count} ${count === 1 ? 'reply' : 'replies'}`;

const participantOf = (
  userId: string,
  usersById: ReadonlyMap<string, User>,
): ThreadParticipant => ({
  id: userId,
  name: usersById.get(userId)?.name ?? 'Someone',
  seed: userColorSeed(userId),
});

export const threadPreviewOf = (
  summary: ThreadSummary,
  usersById: ReadonlyMap<string, User>,
): ThreadPreview => ({
  ...summary,
  participants: summary.participantIds.map((userId) => participantOf(userId, usersById)),
});

const repliesSeparator = (count: number): DayRow => ({
  kind: 'day',
  key: REPLIES_SEPARATOR_KEY,
  label: count > 0 ? replyCountLabel(count) : NO_REPLIES_LABEL,
});

const startingGroup = (row: MessageRow): MessageRow => ({
  ...row,
  message: { ...row.message, continuation: false },
});

const isMessageRow = (row: ThreadRow): row is MessageRow => row.kind === 'message';

export const threadPanelRows = (rows: readonly ThreadRow[], rootId: string): ThreadRow[] => {
  const [root, ...replies] = rows.filter(isMessageRow);
  if (!root || root.message.id !== rootId || root.message.isReply) {
    return [];
  }
  const [firstReply, ...laterReplies] = replies;
  const replyRows = firstReply ? [startingGroup(firstReply), ...laterReplies] : [];
  return [root, repliesSeparator(replies.length), ...replyRows];
};
