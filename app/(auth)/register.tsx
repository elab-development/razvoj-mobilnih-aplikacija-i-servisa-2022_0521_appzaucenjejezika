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
    case 'auth/email-already-in-use':
      return 'Ova email adresa je već registrovana.';
    case 'auth/invalid-email':
      return 'Unesite ispravnu email adresu.';
    case 'auth/weak-password':
      return 'Lozinka mora imati najmanje 6 karaktera.';
    default:
      return 'Registracija nije uspela. Pokušajte ponovo.';
  }
}

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Greška', 'Popunite sva obavezna polja.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Greška', 'Lozinke se ne poklapaju.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Greška', 'Lozinka mora imati najmanje 6 karaktera.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, name, password);
    } catch (error) {
      Alert.alert('Greška', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Napravite nalog"
      subtitle="Čuvajte prepoznate predmete, prevode i nove reči u svom privatnom VizDict rečniku."
      footer={
        <Text style={styles.footerText}>
          Već imate nalog?{' '}
          <Link href="/login" style={styles.link}>
            Prijavite se
          </Link>
        </Text>
      }
    >
      <AuthTextField
        label="Ime"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        placeholder="Vaše ime"
      />

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
        autoComplete="new-password"
        placeholder="Najmanje 6 karaktera"
      />

      <AuthTextField
        label="Potvrdite lozinku"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoComplete="new-password"
        placeholder="Ponovite lozinku"
      />

      <PrimaryButton title="Registruj se" loading={loading} onPress={handleRegister} />
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