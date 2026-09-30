import { Pipe, PipeTransform } from '@angular/core';

const MAX_INITIALS = 2;

export const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, MAX_INITIALS)
    .join('')
    .toUpperCase();

@Pipe({ name: 'initials' })
export class InitialsPipe implements PipeTransform {
  transform(name: string | null | undefined): string {
    return name ? initialsOf(name) : '';
  }
}
