import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

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
       Alert.alert('Greska', 'Odjava nije uspela. Pokusajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
   <AppScreenLayout
      title="Profile"
      subtitle="Detalji naloga koji koristi vas privatni recnik."
    >
      <View style={styles.card}>
        <Text style={styles.name}>{profile?.name ?? 'Korisnik'}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{profile?.email ?? '-'}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.actionCard, pressed && styles.cardPressed]}
        onPress={() => router.push('/stats')}
      >
        <View style={styles.actionIcon}>
          <Ionicons name="analytics-outline" size={24} color="#155E63" />
        </View>

        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Statistika koriscenja</Text>
          <Text style={styles.actionText}>
            Pregled sacuvanih reci po jezicima, mesecima i ritmu koriscenja.
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#8A9994" />
      </Pressable>

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
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D6E0DC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardPressed: {
    opacity: 0.88,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#EFF7F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#13221F',
  },
  actionText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64746F',
  },
});