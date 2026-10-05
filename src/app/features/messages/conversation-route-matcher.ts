import { UrlMatcher, UrlMatchResult, UrlSegment } from '@angular/router';

const PARAM_PREFIX = ':';
const SUFFIX_LENGTH = 2;
const SUFFIX_PARAMS: ReadonlyMap<string, string> = new Map([
  ['m', 'messageId'],
  ['thread', 'rootId'],
]);

type SegmentParams = Record<string, UrlSegment>;

const matchPrefix = (
  pattern: readonly string[],
  segments: readonly UrlSegment[],
): SegmentParams | null => {
  if (segments.length < pattern.length) {
    return null;
  }
  const params: SegmentParams = {};
  for (const [index, part] of pattern.entries()) {
    const segment = segments[index];
    if (part.startsWith(PARAM_PREFIX)) {
      params[part.slice(PARAM_PREFIX.length)] = segment;
    } else if (segment.path !== part) {
      return null;
    }
  }
  return params;
};

const matchSuffix = (rest: readonly UrlSegment[]): SegmentParams | null => {
  if (rest.length === 0) {
    return {};
  }
  const name = rest.length === SUFFIX_LENGTH ? SUFFIX_PARAMS.get(rest[0].path) : undefined;
  return name ? { [name]: rest[1] } : null;
};

export const conversationRouteMatcher =
  (pattern: readonly string[]): UrlMatcher =>
  (segments): UrlMatchResult | null => {
    const prefix = matchPrefix(pattern, segments);
    const suffix = prefix ? matchSuffix(segments.slice(pattern.length)) : null;
    return prefix && suffix ? { consumed: segments, posParams: { ...prefix, ...suffix } } : null;
  };
