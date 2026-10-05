export const EMOJI_NAMES: Readonly<Record<string, string>> = {
  '😀': 'grinning face',
  '😂': 'face with tears of joy',
  '🙂': 'slightly smiling face',
  '😉': 'winking face',
  '😍': 'smiling face with heart eyes',
  '🤔': 'thinking face',
  '😅': 'grinning face with sweat',
  '🙌': 'raising hands',
  '👏': 'clapping hands',
  '🙏': 'folded hands',
  '💪': 'flexed biceps',
  '🔥': 'fire',
  '✨': 'sparkles',
  '💯': 'hundred points',
  '👍': 'thumbs up',
  '👎': 'thumbs down',
  '❤️': 'heart',
  '🎉': 'party popper',
  '👀': 'eyes',
  '🚀': 'rocket',
  '✅': 'check mark',
  '❌': 'cross mark',
  '⚡': 'high voltage',
  '☕': 'hot beverage',
};

export const emojiName = (emoji: string): string => EMOJI_NAMES[emoji] ?? emoji;

export const reactionLabel = (emoji: string): string => `React with ${emojiName(emoji)}`;
