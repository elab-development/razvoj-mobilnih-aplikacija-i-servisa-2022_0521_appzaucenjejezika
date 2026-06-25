import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AppScreenLayout({ title, subtitle, children }: AppScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>VizDict</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAF8',
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
    color: '#155E63',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#13221F',
  },
  subtitle: {
    fontSize: 15,
    color: '#64746F',
    lineHeight: 22,
  },
  content: {
    gap: 16,
  },
});