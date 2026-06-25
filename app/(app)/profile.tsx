import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { profile, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      await logout();
    } catch {
      Alert.alert('Greška', 'Odjava nije uspela. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreenLayout title="Profile" subtitle="Detalji naloga koji koristi vaš privatni rečnik.">
      <View style={styles.card}>
        <Text style={styles.name}>{profile?.name ?? 'Korisnik'}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{profile?.email ?? '-'}</Text>
        </View>
      </View>

      <PrimaryButton
        title="Odjavi se"
        variant="secondary"
        loading={loading}
        onPress={handleLogout}
      />
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D6E0DC',
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#13221F',
  },
  infoBox: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#D6E0DC',
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A9994',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#13221F',
  },
});