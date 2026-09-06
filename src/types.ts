export type TranslationDirection = 'th-my' | 'my-th' | 'auto';

export type WordCategory =
  | 'all'
  | 'greetings'
  | 'meat'
  | 'veg'
  | 'fruit'
  | 'food'
  | 'drink'
  | 'people'
  | 'travel'
  | 'numbers'
  | 'emergency';

export interface VocabWord {
  id: number;
  thai: string;
  phonetic: string; // Myanmar script phonetics
  romanization?: string; // Latin transcription
  meaning: string; // Myanmar translation
  catId: WordCategory;
  category: string; // Human-readable category label (Myanmar / Bilingual)
  partOfSpeech?: string;
  exampleThai?: string;
  exampleMyanmar?: string;
  examplePhonetic?: string;
}

export interface TranslationResult {
  detectedSource?: string;
  targetLanguage?: string;
  translatedText: string;
  phonetic?: string;
  romanization?: string;
  partOfSpeech?: string;
  meaningExplanation?: string;
  breakdown?: Array<{
    original: string;
    translated: string;
    meaning?: string;
  }>;
  examples?: Array<{
    source: string;
    translation: string;
    phonetic?: string;
  }>;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  direction: TranslationDirection;
  timestamp: number;
  resultSummary: string;
}
