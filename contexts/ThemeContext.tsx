import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemeAccent = 'green' | 'blue' | 'red' | 'orange';

type ThemeAccentOption = {
  key: ThemeAccent;
  label: string;
  color: string;
};

type ThemeColors = {
  accent: string;
  accentSoft: string;
  accentText: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSoft: string;
  inverseText: string;
};

type AppTheme = {
  mode: ThemeMode;
  accent: ThemeAccent;
  colors: ThemeColors;
};

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  accent: ThemeAccent;
  accentOptions: ThemeAccentOption[];
  setMode: (mode: ThemeMode) => Promise<void>;
  setAccent: (accent: ThemeAccent) => Promise<void>;
};

const THEME_STORAGE_KEY = 'vizdict.theme.v1';

export const THEME_ACCENT_OPTIONS: ThemeAccentOption[] = [
  { key: 'green', label: 'Zelena', color: '#155E63' },
  { key: 'blue', label: 'Plava', color: '#2563EB' },
  { key: 'red', label: 'Crvena', color: '#DC2626' },
  { key: 'orange', label: 'Narandžasta', color: '#EA580C' },
];

const lightBase = {
  background: '#F7FAF8',
  surface: '#FFFFFF',
  surfaceMuted: '#EFF7F4',
  border: '#D6E0DC',
  borderStrong: '#BFD1CC',
  text: '#13221F',
  textMuted: '#64746F',
  textSoft: '#8A9994',
  inverseText: '#FFFFFF',
};

const darkBase = {
  background: '#08110F',
  surface: '#111C19',
  surfaceMuted: '#1C2B27',
  border: '#29403A',
  borderStrong: '#35554E',
  text: '#EFF7F4',
  textMuted: '#AFC1BB',
  textSoft: '#7E948D',
  inverseText: '#FFFFFF',
};

const accentSoftByMode: Record<ThemeMode, Record<ThemeAccent, string>> = {
  light: {
    green: '#EFF7F4',
    blue: '#EFF6FF',
    red: '#FEF2F2',
    orange: '#FFF7ED',
  },
  dark: {
    green: '#143633',
    blue: '#172554',
    red: '#3F1518',
    orange: '#431F08',
  },
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

function isThemeAccent(value: unknown): value is ThemeAccent {
  return THEME_ACCENT_OPTIONS.some((option) => option.key === value);
}

function createTheme(mode: ThemeMode, accent: ThemeAccent): AppTheme {
  const accentOption =
    THEME_ACCENT_OPTIONS.find((option) => option.key === accent) ??
    THEME_ACCENT_OPTIONS[0];
  const base = mode === 'dark' ? darkBase : lightBase;

  return {
    mode,
    accent,
    colors: {
      ...base,
      accent: accentOption.color,
      accentSoft: accentSoftByMode[mode][accent],
      accentText: accentOption.color,
    },
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [accent, setAccentState] = useState<ThemeAccent>('green');

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((storedValue) => {
        if (!storedValue || !isMounted) {
          return;
        }

        const parsed = JSON.parse(storedValue) as {
          mode?: unknown;
          accent?: unknown;
        };

        if (isThemeMode(parsed.mode)) {
          setModeState(parsed.mode);
        }

        if (isThemeAccent(parsed.accent)) {
          setAccentState(parsed.accent);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const persistTheme = useCallback(
    async (nextMode: ThemeMode, nextAccent: ThemeAccent) => {
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ mode: nextMode, accent: nextAccent }),
      );
    },
    [],
  );

  const setMode = useCallback(
    async (nextMode: ThemeMode) => {
      setModeState(nextMode);
      await persistTheme(nextMode, accent);
    },
    [accent, persistTheme],
  );

  const setAccent = useCallback(
    async (nextAccent: ThemeAccent) => {
      setAccentState(nextAccent);
      await persistTheme(mode, nextAccent);
    },
    [mode, persistTheme],
  );

  const theme = useMemo(() => createTheme(mode, accent), [accent, mode]);

  const value = useMemo(
    () => ({
      theme,
      mode,
      accent,
      accentOptions: THEME_ACCENT_OPTIONS,
      setMode,
      setAccent,
    }),
    [accent, mode, setAccent, setMode, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}