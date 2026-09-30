import { Pipe, PipeTransform } from '@angular/core';
import { pluralOf } from './plural.pipe';

export const formatCount = (count: number, singular: string, plural?: string): string =>
  `${count} ${pluralOf(count, singular, plural)}`;

@Pipe({ name: 'count' })
export class CountPipe implements PipeTransform {
  transform(count: number, singular: string, plural?: string): string {
    return formatCount(count, singular, plural);
  }
}
