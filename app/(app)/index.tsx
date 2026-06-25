import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function ScanScreen() {
  return (
    <AppScreenLayout
      title="Scan"
      subtitle="Prepoznajte predmet kamerom ili iz galerije, zatim sačuvajte prevod u privatni rečnik."
    >
      <View style={styles.scannerPanel}>
        <View style={styles.viewfinder}>
          <Ionicons name="scan-outline" size={54} color="#155E63" />
          <Text style={styles.viewfinderText}>Spremno za prepoznavanje</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Otvori kameru" onPress={() => undefined} />
          <PrimaryButton
            title="Izaberi iz galerije"
            variant="secondary"
            onPress={() => undefined}
          />
        </View>
      </View>

      <View style={styles.translationPanel}>
        <Text style={styles.panelLabel}>Jezik prevoda</Text>
        <View style={styles.languageRow}>
          <Text style={styles.languageValue}>Engleski</Text>
          <Ionicons name="chevron-down" size={20} color="#155E63" />
        </View>
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  scannerPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  viewfinder: {
    minHeight: 260,
    borderWidth: 1,
    borderColor: '#BFD1CC',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EFF7F4',
  },
  viewfinderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F413D',
  },
  actions: {
    gap: 12,
  },
  translationPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64746F',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#13221F',
  },
});