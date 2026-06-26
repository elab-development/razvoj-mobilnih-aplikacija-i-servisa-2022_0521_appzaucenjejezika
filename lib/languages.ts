export const LANGUAGE_OPTIONS = [
  {
    code: 'en',
    label: 'Engleski',
    promptName: 'English',
  },
  {
    code: 'de',
    label: 'Nemacki',
    promptName: 'German',
  },
  {
    code: 'es',
    label: 'Spanski',
    promptName: 'Spanish',
  },
  {
    code: 'fr',
    label: 'Francuski',
    promptName: 'French',
  },
  {
    code: 'it',
    label: 'Italijanski',
    promptName: 'Italian',
  },
  {
    code: 'sr',
    label: 'Srpski',
    promptName: 'Serbian in Latin script',
  },
] as const;

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code'];
export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];

export const DEFAULT_LANGUAGE = LANGUAGE_OPTIONS[0];

export function getLanguageByCode(code: LanguageCode): LanguageOption {
  return LANGUAGE_OPTIONS.find((language) => language.code === code) ?? DEFAULT_LANGUAGE;
}