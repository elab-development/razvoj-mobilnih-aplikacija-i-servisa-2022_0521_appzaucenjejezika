import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

export type SelectedImage = {
  uri: string;
  width?: number;
  height?: number;
  fileName?: string | null;
};

type SelectedImageContextValue = {
  selectedImage: SelectedImage | null;
  setSelectedImage: (image: SelectedImage | null) => void;
};

const SelectedImageContext = createContext<SelectedImageContextValue | null>(null);

export function SelectedImageProvider({ children }: { children: ReactNode }) {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const value = useMemo(
    () => ({
      selectedImage,
      setSelectedImage,
    }),
    [selectedImage],
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