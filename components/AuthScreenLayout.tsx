import { type ReactNode } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type AuthScreenLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreenLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>V</Text>
          </View>
          <Text style={styles.brand}>VizDict</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.form}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 30,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#155E63',
    marginBottom: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  brand: {
    fontSize: 14,
    fontWeight: '700',
    color: '#155E63',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#13221F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64746F',
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
});