import { Attachment, Message } from '../models/message';
import { extensionOf, FileItem, FileSource, fileTypeOf, UPLOAD_SOURCE } from '../models/file-item';
import { MOCK_CHANNELS } from './channels.mock';
import { MOCK_CONVERSATIONS } from './conversations.mock';
import { buildMockMessages } from './messages.mock';
import { minutesAgo, MINUTES_PER_DAY } from './mock-clock';
import { MOCK_TASKS } from './tasks.mock';
import { MOCK_TEAMS } from './teams.mock';
import { MOCK_USERS } from './users.mock';

interface FileSeed {
  readonly id: string;
  readonly name: string;
  readonly sizeLabel: string;
  readonly ownerId: string;
  readonly minutesAgo: number;
  readonly location: string;
  readonly starred: boolean;
}

interface Placement {
  readonly source: FileSource;
  readonly teamId: string | null;
}

const WORKSPACE_ID = 'w1';
const PRIVATE_LOCATION = 'Only you';
const TASK_FILE_WINDOW = 6;
const DERIVED_FILE_PREFIX = 'fa';

const DAY = MINUTES_PER_DAY;

const seed = (
  id: string,
  name: string,
  sizeLabel: string,
  ownerId: string,
  age: number,
  location: string,
  starred = false,
): FileSeed => ({ id, name, sizeLabel, ownerId, minutesAgo: age, location, starred });

const SEEDS: readonly FileSeed[] = [
  seed('f1', 'Q4 Roadmap.pdf', '2.4 MB', 'u4', 90, '#releases', true),
  seed('f2', 'Onboarding v3.fig', '18.6 MB', 'u2', DAY + 30, 'Design'),
  seed('f3', 'composer-states.pdf', '1.8 MB', 'u1', 95, 'Rahul Mehta'),
  seed('f4', 'CHANGELOG-2.4.md', '12 KB', 'u1', 140, 'Launch crew'),
  seed('f5', 'release-banner-v2.png', '640 KB', 'u2', DAY + 280, 'Launch crew'),
  seed('f6', 'Design QA — 2.4.pdf', '3.1 MB', 'u2', 150, '#frontend'),
  seed('f7', 'Sprint 24 metrics.xlsx', '284 KB', 'u11', DAY + 120, 'Frontend'),
  seed('f8', 'Q4 OKRs.docx', '96 KB', 'u4', 4 * DAY + 60, 'Q4 planning'),
  seed('f9', 'api-v2-spec.yaml', '48 KB', 'u3', 2 * DAY, '#api-v2'),
  seed('f10', 'Brand guidelines 2026.pdf', '12.4 MB', 'u9', 5 * DAY, 'Growth'),
  seed('f11', 'Customer interviews.zip', '84.2 MB', 'u10', 7 * DAY, 'Customer Success'),
  seed('f12', 'Product demo.mp4', '146 MB', 'u9', 8 * DAY, 'Growth'),
  seed('f13', 'Board update — September.pptx', '7.9 MB', 'u0', 3 * DAY, PRIVATE_LOCATION, true),
  seed('f14', 'Hiring plan H2.xlsx', '152 KB', 'u0', 9 * DAY, PRIVATE_LOCATION),
  seed('f15', 'Architecture overview.pdf', '5.6 MB', 'u0', 11 * DAY, 'Platform'),
];

const SIZE_UNITS: Readonly<Record<string, number>> = { B: 1, KB: 1e3, MB: 1e6, GB: 1e9 };
const SIZE_PATTERN = /^([\d.]+)\s*(B|KB|MB|GB)$/i;

export const bytesOfSizeLabel = (sizeLabel: string): number => {
  const match = SIZE_PATTERN.exec(sizeLabel.trim());
  return match ? Math.round(Number(match[1]) * SIZE_UNITS[match[2].toUpperCase()]) : 0;
};

const messages = buildMockMessages();
const channelsByLocation = new Map(MOCK_CHANNELS.map((channel) => [`#${channel.name}`, channel]));
const groupsByName = new Map(
  MOCK_CONVERSATIONS.filter((conversation) => conversation.type === 'group').map((group) => [
    group.name,
    group,
  ]),
);
const directIds = new Set(
  MOCK_CONVERSATIONS.filter((conversation) => conversation.type === 'dm').map(({ id }) => id),
);
const userIdsByName = new Map(MOCK_USERS.map((user) => [user.name, user.id]));
const teamIdsByName = new Map(MOCK_TEAMS.map((team) => [team.name, team.id]));

const locationOf = (conversationId: string): string => {
  const channel = MOCK_CHANNELS.find(({ id }) => id === conversationId);
  if (channel) {
    return `#${channel.name}`;
  }
  const conversation = MOCK_CONVERSATIONS.find(({ id }) => id === conversationId);
  if (conversation?.type === 'group') {
    return conversation.name;
  }
  const userId = conversation?.type === 'dm' ? conversation.userId : '';
  return MOCK_USERS.find(({ id }) => id === userId)?.name ?? '';
};

const messageWith = (conversationId: string, fileName: string): Message | null =>
  (messages[conversationId] ?? []).find((message) =>
    message.attachments.some((attachment) => attachment.name === fileName),
  ) ?? null;

const fromConversation = (conversationId: string, fileName: string): FileSource => ({
  type: 'message',
  conversationId,
  messageId: messageWith(conversationId, fileName)?.id ?? null,
});

const conversationIdAt = (location: string): string | null => {
  const channel = channelsByLocation.get(location);
  const directId = `dm-${userIdsByName.get(location) ?? ''}`;
  const conversationId =
    channel?.id ?? groupsByName.get(location)?.id ?? (directIds.has(directId) ? directId : null);
  return conversationId && messages[conversationId] ? conversationId : null;
};

const placementOf = (seed: FileSeed): Placement => {
  const conversationId = conversationIdAt(seed.location);
  if (conversationId) {
    const teamId = channelsByLocation.get(seed.location)?.teamId ?? null;
    return { source: fromConversation(conversationId, seed.name), teamId };
  }
  return { source: UPLOAD_SOURCE, teamId: teamIdsByName.get(seed.location) ?? null };
};

const taskIdsByFile = (): ReadonlyMap<string, readonly string[]> => {
  const links = new Map<string, string[]>();
  MOCK_TASKS.filter((task) => task.workspaceId === WORKSPACE_ID).forEach((task, index) => {
    const start = index % TASK_FILE_WINDOW;
    SEEDS.slice(start, start + task.attachmentCount).forEach((seed) =>
      links.set(seed.id, [...(links.get(seed.id) ?? []), task.id]),
    );
  });
  return links;
};

const fileFromSeed = (seed: FileSeed, taskIds: readonly string[]): FileItem => {
  const placement = placementOf(seed);
  const timestamp = minutesAgo(seed.minutesAgo);
  return {
    workspaceId: WORKSPACE_ID,
    id: seed.id,
    name: seed.name,
    extension: extensionOf(seed.name),
    type: fileTypeOf(seed.name),
    sizeLabel: seed.sizeLabel,
    bytes: bytesOfSizeLabel(seed.sizeLabel),
    ownerId: seed.ownerId,
    uploadedAt: timestamp,
    modifiedAt: timestamp,
    location: seed.location,
    shared: seed.location !== PRIVATE_LOCATION,
    starred: seed.starred,
    source: placement.source,
    teamId: placement.teamId,
    taskIds,
    previewUrl: null,
  };
};

const fileFromAttachment = (message: Message, attachment: Attachment, id: string): FileItem => ({
  workspaceId: WORKSPACE_ID,
  id,
  name: attachment.name,
  extension: extensionOf(attachment.name),
  type: attachment.type,
  sizeLabel: attachment.size,
  bytes: bytesOfSizeLabel(attachment.size),
  ownerId: message.authorId,
  uploadedAt: message.sentAt,
  modifiedAt: message.sentAt,
  location: locationOf(message.conversationId),
  shared: true,
  starred: false,
  source: { type: 'message', conversationId: message.conversationId, messageId: message.id },
  teamId: MOCK_CHANNELS.find(({ id }) => id === message.conversationId)?.teamId ?? null,
  taskIds: [],
  previewUrl: null,
});

const attachmentFiles = (knownNames: ReadonlySet<string>): FileItem[] => {
  const names = new Set(knownNames);
  const files: FileItem[] = [];
  Object.values(messages)
    .flat()
    .forEach((message) =>
      message.attachments
        .filter((attachment) => !names.has(attachment.name))
        .forEach((attachment) => {
          names.add(attachment.name);
          const id = `${DERIVED_FILE_PREFIX}${files.length + 1}`;
          files.push(fileFromAttachment(message, attachment, id));
        }),
    );
  return files;
};

const buildMockFiles = (): readonly FileItem[] => {
  const taskIds = taskIdsByFile();
  const seeded = SEEDS.map((seed) => fileFromSeed(seed, taskIds.get(seed.id) ?? []));
  return [...seeded, ...attachmentFiles(new Set(SEEDS.map((seed) => seed.name)))];
};

export const MOCK_FILES: readonly FileItem[] = buildMockFiles();
