import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  DEFAULT_LANGUAGE,
  getLanguageByCode,
  type LanguageCode,
  type LanguageOption,
} from '@/lib/languages';

export type SelectedImage = {
  uri: string;
  width?: number;
  height?: number;
  fileName?: string | null;
  mimeType?: string | null;
};

type SelectedImageContextValue = {
  selectedImage: SelectedImage | null;
  setSelectedImage: (image: SelectedImage | null) => void;
  targetLanguage: LanguageOption;
  setTargetLanguageCode: (code: LanguageCode) => void;
};

const SelectedImageContext = createContext<SelectedImageContextValue | null>(null);

export function SelectedImageProvider({ children }: { children: ReactNode }) {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [targetLanguageCode, setTargetLanguageCode] = useState<LanguageCode>(
    DEFAULT_LANGUAGE.code,
  );
  const targetLanguage = useMemo(
    () => getLanguageByCode(targetLanguageCode),
    [targetLanguageCode],
  );

  const value = useMemo(
    () => ({
      selectedImage,
      setSelectedImage,
      targetLanguage,
      setTargetLanguageCode,
    }),
    [selectedImage, targetLanguage],
  );

  return (
    <SelectedImageContext.Provider value={value}>
      {children}
    </SelectedImageContext.Provider>
  );
}

export function useSelectedImage() {
  const context = useContext(SelectedImageContext);

  if (!context) {
    throw new Error('useSelectedImage must be used within SelectedImageProvider');
  }

  return context;
}