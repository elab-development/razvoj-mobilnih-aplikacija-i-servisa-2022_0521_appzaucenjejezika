import { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS, type LanguageCode } from '@/lib/languages';
import type { DictionaryEntry, RecognitionConfidence } from '@/types/dictionary';

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function asConfidence(value: unknown): RecognitionConfidence {
  if (value === 'high' || value === 'medium' || value === 'low') {
    return value;
  }

  return 'medium';
}

export function isLanguageCode(value: unknown): value is LanguageCode {
  return (
    typeof value === 'string' &&
    LANGUAGE_OPTIONS.some((language) => language.code === value)
  );
}

export function asLanguageCode(value: unknown): LanguageCode {
  return isLanguageCode(value) ? value : DEFAULT_LANGUAGE.code;
}

export function parseDictionaryEntry(
  id: string,
  data: Record<string, unknown>,
): DictionaryEntry {
  return {
    id,
    sourceWord: typeof data.sourceWord === 'string' ? data.sourceWord : 'unknown',
    translatedWord:
      typeof data.translatedWord === 'string' ? data.translatedWord : 'unknown',
    targetLanguageCode: asLanguageCode(data.targetLanguageCode),
    targetLanguageLabel:
      typeof data.targetLanguageLabel === 'string'
        ? data.targetLanguageLabel
        : DEFAULT_LANGUAGE.label,
    description: typeof data.description === 'string' ? data.description : '',
    examples: asStringArray(data.examples),
    alternatives: asStringArray(data.alternatives),
    confidence: asConfidence(data.confidence),
    imagePath: typeof data.imagePath === 'string' ? data.imagePath : '',
    imageFileName:
      typeof data.imageFileName === 'string' ? data.imageFileName : null,
    imageWidth: typeof data.imageWidth === 'number' ? data.imageWidth : null,
    imageHeight: typeof data.imageHeight === 'number' ? data.imageHeight : null,
    model: typeof data.model === 'string' ? data.model : undefined,
    createdAtIso:
      typeof data.createdAtIso === 'string' ? data.createdAtIso : undefined,
  };
}

export function searchDictionaryEntry(entry: DictionaryEntry, term: string) {
  const normalizedTerm = term.trim().toLowerCase();

  if (!normalizedTerm) {
    return true;
  }

  const searchableText = [
    entry.sourceWord,
    entry.translatedWord,
    entry.description,
    ...entry.examples,
    ...entry.alternatives,
  ]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(normalizedTerm);
}