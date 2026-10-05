import { IconName } from '../../../shared/ui/icon/icon-registry';

export type TeamDialogMode = 'create' | 'edit';

export interface TeamDialogCopy {
  readonly heading: string;
  readonly description: string;
  readonly submitLabel: string;
  readonly submitIcon: IconName;
}

export const TEAM_DIALOG_COPY: Record<TeamDialogMode, TeamDialogCopy> = {
  create: {
    heading: 'Create team',
    description: 'Teams bring people, channels and files together around shared work.',
    submitLabel: 'Create team',
    submitIcon: 'plus',
  },
  edit: {
    heading: 'Team settings',
    description: 'Changes apply for everyone in the team.',
    submitLabel: 'Save changes',
    submitIcon: 'check',
  },
};
