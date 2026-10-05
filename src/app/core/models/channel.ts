export interface Channel {
  readonly id: string;
  readonly teamId: string;
  readonly name: string;
  readonly description: string;
  readonly memberIds: readonly string[];
  readonly isPrivate: boolean;
  readonly createdLabel: string;
  readonly createdBy: string;
}

export interface NewChannel {
  readonly teamId: string;
  readonly name: string;
  readonly description: string;
  readonly isPrivate: boolean;
}

export interface ChannelChanges {
  readonly name: string;
  readonly description: string;
  readonly isPrivate: boolean;
}

export const GENERAL_CHANNEL_NAME = 'general';
