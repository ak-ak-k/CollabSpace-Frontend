import { Pipe, PipeTransform } from '@angular/core';
import { formatRelative, formatWhen } from './time-format';

export type TimeAgoStyle = 'relative' | 'when';

@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(
    timestamp: number | null | undefined,
    style: TimeAgoStyle = 'relative',
    now = Date.now(),
  ): string {
    if (timestamp === null || timestamp === undefined) {
      return '';
    }
    return style === 'when' ? formatWhen(timestamp, now) : formatRelative(timestamp, now);
  }
}
