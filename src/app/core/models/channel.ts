export interface Channel {
  readonly id: string;
  readonly teamId: string;
  readonly name: string;
  readonly description: string;
  readonly memberIds: readonly string[];
  readonly isPrivate: boolean;
  readonly createdLabel: string;
}
