import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

type ProfileActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  onPress: () => void;
};

function ProfileActionCard({ icon, title, text, onPress }: ProfileActionCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: theme.colors.accentSoft }]}>
        <Ionicons name={icon} size={24} color={theme.colors.accent} />
      </View>

      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>
          {text}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSoft} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { profile, logout } = useAuth();
   const { theme } = useTheme();
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
   <AppScreenLayout
      title="Profile"
      subtitle="Detalji naloga koji koristi vaš privatni rečnik."
    >
       <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
         <Text style={[styles.name, { color: theme.colors.text }]}>
          {profile?.name ?? 'Korisnik'}
        </Text>

         <View style={[styles.infoBox, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.infoLabel, { color: theme.colors.textSoft }]}>
            Email
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>
            {profile?.email ?? '-'}
          </Text>
        </View>
</View>

      <ProfileActionCard
        icon="settings-outline"
        title="Settings"
        text="Promenite boju aplikacije i izaberite light ili dark temu."
        onPress={() => router.push('/settings')}
      />

        <ProfileActionCard
        icon="analytics-outline"
        title="Statistika korišćenja"
        text="Pregled sačuvanih reči po jezicima, mesecima i ritmu korišćenja."
        onPress={() => router.push('/stats')}
      />

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
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
   },
  infoBox: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
  },
  actionCard: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
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
  },
  actionText: {
    fontSize: 13,
    lineHeight: 19,
  },
});