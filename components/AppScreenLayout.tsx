import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';

type AppScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AppScreenLayout({ title, subtitle, children }: AppScreenLayoutProps) {
   const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
           <Text style={[styles.brand, { color: theme.colors.accent }]}>VizDict</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 18,
  },
  header: {
    gap: 6,
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  content: {
    gap: 16,
  },
});