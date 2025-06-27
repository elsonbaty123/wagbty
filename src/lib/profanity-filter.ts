
// An expanded list of profane words in English and Arabic, including Egyptian slang.
// In a real-world application, this list would be much more extensive and carefully curated.
export const blockedWords = [
  // English
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'dick', 'pussy', 'sex',
  // English Variations
  'f@ck', 's3x', 'b!tch', 'fuc', 'fuk',
  // Arabic & Egyptian Slang (as requested by user)
  "كس", "زب", "نيك", "خول", "شرموط", "عرص", "منيك", "متناك", 
  "كسمك", "امك", "ابوك", "أوسخ", "حيوان", "كلب", "متخلف", 
  "غبي", "عبيط", "قذر", "وسخ", "عرة", "بيئة", "صايع", "عاهرة", "اللعنة", "سكس"
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
  
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      // Remove Arabic diacritics
      .replace(/[\u064B-\u0652]/g, '')
      // Standardize Arabic characters
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      // Remove characters that could be used to bypass the filter
      .replace(/[\s-._,]/g, '');
  };

  const normalizedText = normalize(text);

  // 1. Check for blocked words
  const hasBlockedWord = blockedWords.some(word => normalizedText.includes(normalize(word)));
  if (hasBlockedWord) {
    return true;
  }

  // 2. Check for character spam
  if (spamRegex.test(normalizedText)) {
    return true;
  }

  return false;
};
