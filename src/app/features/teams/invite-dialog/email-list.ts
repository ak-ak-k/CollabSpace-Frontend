import { ValidationError } from '@angular/forms/signals';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
const EMAIL_SEPARATOR = /[\s,;]+/;

export const parseEmailList = (text: string): string[] =>
  text.split(EMAIL_SEPARATOR).filter(Boolean);

export const emailListError = (text: string): ValidationError | undefined => {
  const emails = parseEmailList(text);
  if (emails.length === 0) {
    return { kind: 'emailList', message: 'Enter at least one email address.' };
  }
  const invalid = emails.find((email) => !EMAIL_PATTERN.test(email));
  return invalid
    ? { kind: 'emailList', message: `Check ${invalid} — it doesn’t look like an email.` }
    : undefined;
};
