import { Component, input } from '@angular/core';
import { TaskPriority } from '../../../core/models/task';

export type TagTone = 'neutral' | 'primary' | 'outline' | 'subtle';

export const PRIORITY_TAG_TONES: Record<TaskPriority, TagTone> = {
  urgent: 'primary',
  high: 'outline',
  medium: 'neutral',
  low: 'subtle',
};

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
  host: { '[class]': '"tag--" + tone()' },
})
export class TagComponent {
  readonly tone = input<TagTone>('neutral');
}
