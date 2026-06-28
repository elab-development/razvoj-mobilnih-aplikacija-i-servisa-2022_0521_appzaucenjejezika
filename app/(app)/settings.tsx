import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import {
    useTheme,
    type ThemeAccent,
    type ThemeMode,
} from '@/contexts/ThemeContext';

const modeOptions: {
  key: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { theme, mode, accent, accentOptions, setMode, setAccent } = useTheme();

  const handleModePress = (nextMode: ThemeMode) => {
    void setMode(nextMode);
  };

  const handleAccentPress = (nextAccent: ThemeAccent) => {
    void setAccent(nextAccent);
  };

  return (
    <AppScreenLayout
      title="Settings"
      subtitle="Podesite izgled aplikacije izborom teme i osnovne boje."
    >
      <Pressable
        style={[
          styles.backButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={18} color={theme.colors.accent} />
        <Text style={[styles.backText, { color: theme.colors.accent }]}>Nazad</Text>
      </Pressable>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Tema
            </Text>
            <Text style={[styles.sectionText, { color: theme.colors.textMuted }]}>
              Izaberite svetli ili tamni prikaz aplikacije.
            </Text>
          </View>
          <Ionicons name="contrast-outline" size={22} color={theme.colors.accent} />
        </View>

        <View style={styles.modeRow}>
          {modeOptions.map((option) => {
            const isSelected = option.key === mode;

            return (
              <Pressable
                key={option.key}
                style={[
                  styles.modeOption,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.accent
                      : theme.colors.surfaceMuted,
                    borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                  },
                ]}
                onPress={() => handleModePress(option.key)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isSelected ? theme.colors.inverseText : theme.colors.accent}
                />
                <Text
                  style={[
                    styles.modeText,
                    {
                      color: isSelected
                        ? theme.colors.inverseText
                        : theme.colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Osnovna boja
            </Text>
            <Text style={[styles.sectionText, { color: theme.colors.textMuted }]}>
              Boja se koristi za dugmad, ikone i aktivna stanja.
            </Text>
          </View>
          <Ionicons name="color-palette-outline" size={22} color={theme.colors.accent} />
        </View>

        <View style={styles.accentGrid}>
          {accentOptions.map((option) => {
            const isSelected = option.key === accent;

            return (
              <Pressable
                key={option.key}
                style={[
                  styles.accentOption,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: isSelected ? option.color : theme.colors.border,
                  },
                ]}
                onPress={() => handleAccentPress(option.key)}
              >
                <View style={[styles.swatch, { backgroundColor: option.color }]}>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  ) : null}
                </View>
                <Text style={[styles.accentText, { color: theme.colors.text }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: theme.colors.accentSoft,
            borderColor: theme.colors.borderStrong,
          },
        ]}
      >
        <Text style={[styles.previewLabel, { color: theme.colors.textMuted }]}>
          Pregled
        </Text>
        <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
          VizDict
        </Text>
        <View style={[styles.previewButton, { backgroundColor: theme.colors.accent }]}>
          <Text style={[styles.previewButtonText, { color: theme.colors.inverseText }]}>
            Primarna akcija
          </Text>
        </View>
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  backButton: {
    minHeight: 42,
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeOption: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modeText: {
    fontSize: 15,
    fontWeight: '800',
  },
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  accentOption: {
    width: '48%',
    minWidth: 136,
    flexGrow: 1,
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentText: {
    fontSize: 15,
    fontWeight: '800',
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  previewButton: {
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});