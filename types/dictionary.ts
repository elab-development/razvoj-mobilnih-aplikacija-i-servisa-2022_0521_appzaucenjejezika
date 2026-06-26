import type { LanguageCode } from '@/lib/languages';

export type RecognitionConfidence = 'high' | 'medium' | 'low';

export type DictionaryEntry = {
  id: string;
  sourceWord: string;
  translatedWord: string;
  targetLanguageCode: LanguageCode;
  targetLanguageLabel: string;
  description: string;
  examples: string[];
  alternatives: string[];
  confidence: RecognitionConfidence;
  imagePath: string;
  imageFileName?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  model?: string;
  createdAtIso?: string;
};

export type RecognizeImageRequest = {
  imagePath: string;
  targetLanguageCode: LanguageCode;
  imageFileName?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
};

export type RecognizeImageResponse = {
  entryId: string;
  entry: DictionaryEntry;
};