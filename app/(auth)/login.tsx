import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthScreenLayout } from '@/components/AuthScreenLayout';
import { AuthTextField } from '@/components/AuthTextField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';

function getAuthErrorMessage(error: unknown) {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : null;

  switch (code) {
    case 'auth/invalid-email':
      return 'Unesite ispravnu email adresu.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email ili lozinka nisu ispravni.';
    case 'auth/too-many-requests':
      return 'Previše pokušaja. Pokušajte ponovo kasnije.';
    default:
      return 'Prijava nije uspela. Pokušajte ponovo.';
  }
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Greška', 'Unesite email i lozinku.');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Greška', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Dobro došli nazad"
      subtitle="Prijavite se da nastavite sa skeniranjem predmeta i čuvanjem reči u privatnom rečniku."
      footer={
        <Text style={styles.footerText}>
          Nemate nalog?{' '}
          <Link href="/register" style={styles.link}>
            Registrujte se
          </Link>
        </Text>
      }
    >
      <AuthTextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="ime@example.com"
      />

      <AuthTextField
        label="Lozinka"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        placeholder="Unesite lozinku"
      />

      <PrimaryButton title="Prijavi se" loading={loading} onPress={handleLogin} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  footerText: {
    fontSize: 15,
    color: '#64746F',
  },
  link: {
    color: '#155E63',
    fontWeight: '700',
  },
});