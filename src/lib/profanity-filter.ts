
// A basic list of profane words in English and Arabic.
// In a real-world application, this list would be much more extensive.
export const blockedWords = [
  // English
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'dick', 'pussy', 'sex',
  // Arabic - common offensive words
  'عاهرة', 'زب', 'كس', 'اللعنة', 'سكس',
  // Variations and common misspellings to catch
  'f@ck', 's3x', 'b!tch', 'fuc', 'fuk',
];

// A simple regex to catch character spamming, e.g., "aaaaaa"
const spamRegex = /(.)\1{4,}/i; // 5 or more identical consecutive characters

/**
 * Checks if a given text contains profane words or spam patterns.
 * Normalizes text to handle some variations.
 * @param text The text to check.
 * @returns True if the text is considered inappropriate, false otherwise.
 */
export const containsProfanity = (text: string): boolean => {
  // Normalize text: lowercase, remove spaces and some common separators
  const normalizedText = text.toLowerCase().replace(/[\s-._]/g, '');

  // 1. Check for blocked words
  const hasBlockedWord = blockedWords.some(word => normalizedText.includes(word));
  if (hasBlockedWord) {
    return true;
  }

  // 2. Check for character spam
  if (spamRegex.test(normalizedText)) {
    return true;
  }

  return false;
};
