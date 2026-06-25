import { StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';

const sampleWords = [
  { source: 'chair', translated: 'stolica', language: 'Srpski' },
  { source: 'lamp', translated: 'lampa', language: 'Srpski' },
  { source: 'bottle', translated: 'flaša', language: 'Srpski' },
];

export default function DictionaryScreen() {
  return (
    <AppScreenLayout
      title="Dictionary"
      subtitle="Privatna lista predmeta i prevoda koje ste sačuvali."
    >
      {sampleWords.map((word) => (
        <View key={word.source} style={styles.wordCard}>
          <View>
            <Text style={styles.source}>{word.source}</Text>
            <Text style={styles.language}>{word.language}</Text>
          </View>
          <Text style={styles.translated}>{word.translated}</Text>
        </View>
      ))}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  source: {
    fontSize: 18,
    fontWeight: '700',
    color: '#13221F',
  },
  language: {
    marginTop: 4,
    fontSize: 13,
    color: '#64746F',
  },
  translated: {
    fontSize: 18,
    fontWeight: '700',
    color: '#155E63',
  },
});