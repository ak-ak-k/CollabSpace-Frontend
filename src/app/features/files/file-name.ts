export interface FileNameParts {
  readonly base: string;
  readonly extension: string;
}

const NAME_PARTS_PATTERN = /^(.*?)(\.[a-z0-9]+)?$/i;
const FORBIDDEN_CHARACTERS = /[\\/:*?"<>|]/;

export const EMPTY_FILE_NAME_ERROR = 'Enter a file name.';
export const FORBIDDEN_FILE_NAME_ERROR = 'Names can’t contain \\ / : * ? " < > |';

export const splitFileName = (name: string): FileNameParts => {
  const match = NAME_PARTS_PATTERN.exec(name);
  return { base: match?.[1] ?? name, extension: match?.[2] ?? '' };
};

export const fileNameError = (base: string): string => {
  const trimmed = base.trim();
  if (!trimmed) {
    return EMPTY_FILE_NAME_ERROR;
  }
  return FORBIDDEN_CHARACTERS.test(trimmed) ? FORBIDDEN_FILE_NAME_ERROR : '';
};

export const renamedFileName = (base: string, extension: string): string =>
  `${base.trim()}${extension}`;
