import { Pipe, PipeTransform } from '@angular/core';

export const pluralOf = (count: number, singular: string, plural = `${singular}s`): string =>
  count === 1 ? singular : plural;

@Pipe({ name: 'plural' })
export class PluralPipe implements PipeTransform {
  transform(count: number, singular: string, plural?: string): string {
    return pluralOf(count, singular, plural);
  }
}
