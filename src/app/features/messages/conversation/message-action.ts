export type SimpleMessageActionKind =
  'reply' | 'copy' | 'pin' | 'edit' | 'delete' | 'actions' | 'editCancel';

export type MessageAction =
  | { readonly kind: SimpleMessageActionKind; readonly messageId: string }
  | { readonly kind: 'react'; readonly messageId: string; readonly emoji: string }
  | { readonly kind: 'download'; readonly messageId: string; readonly name: string }
  | { readonly kind: 'editSave'; readonly messageId: string; readonly text: string };
