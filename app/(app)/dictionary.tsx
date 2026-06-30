import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { useAuth } from '@/contexts/AuthContext';
import { parseDictionaryEntry } from '@/lib/dictionary';
import { db } from '@/lib/firebase';
import { LANGUAGE_OPTIONS, type LanguageCode, type LanguageOption } from '@/lib/languages';
import type { DictionaryEntry } from '@/types/dictionary';

type LanguageSummary = {
  language: LanguageOption;
  count: number;
  latestEntry: DictionaryEntry | null;
};

  function buildLanguageSummaries(entries: DictionaryEntry[]): LanguageSummary[] {
  return LANGUAGE_OPTIONS.map((language) => {
    const languageEntries = entries.filter(
      (entry) => entry.targetLanguageCode === language.code,
    );

return {
      language,
      count: languageEntries.length,
      latestEntry: languageEntries[0] ?? null,
    };
  });
}

export default function DictionaryScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return undefined;
    }

    const dictionaryQuery = query(
      collection(db, 'users', user.uid, 'dictionary'),
      orderBy('createdAtIso', 'desc'),
    );

    return onSnapshot(
      dictionaryQuery,
      (snapshot) => {
        const nextEntries = snapshot.docs.map((document) =>
          parseDictionaryEntry(document.id, document.data()),
        );

        setEntries(nextEntries);
        setError(null);
        setLoading(false);
      },
      () => {
        setError('Rečnik nije mogao da se učita.'); 
        setLoading(false);
      },
    );
  }, [user]);

   const summaries = useMemo(() => buildLanguageSummaries(entries), [entries]);
  const totalEntries = entries.length;

  const openLanguage = (languageCode: LanguageCode) => {
    router.push({
    pathname: '/(app)/dictionary', // ili samo '/dictionary' ako dopušta, ali grupa foldera je najsigurnija
    params: { languageCode: languageCode },
    });
  };

  return (
    <AppScreenLayout
      title="Dictionary"
            subtitle="Izaberite jezik i otvorite sve predmete koje ste sačuvali za taj prevod."
       >
         <View style={styles.statsPanel}>
        <View>
          <Text style={styles.statsLabel}>Ukupno reči</Text>
          <Text style={styles.statsValue}>{totalEntries}</Text>
        </View>
        <View style={styles.statsIcon}>
          <Ionicons name="library-outline" size={24} color="#155E63" />
        </View>
      </View>

      {loading ? (
        <View style={styles.statePanel}>
          <ActivityIndicator color="#155E63" />
         <Text style={styles.stateText}>Učitavanje jezika...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.statePanel}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

       {!loading && !error ? (
        <View style={styles.languageGrid}>
          {summaries.map(({ language, count, latestEntry }) => (
            <Pressable
              key={language.code}
              style={({ pressed }) => [
                styles.languageCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => openLanguage(language.code)}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.languageIcon}>
                  <Text style={styles.languageCode}>{language.code}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8A9994" />
              </View>

           <View>
                <Text style={styles.languageTitle}>{language.label}</Text>
                <Text style={styles.languageMeta}>
                  {count === 1 ? '1 unos' : `${count} unosa`}
                </Text>
              </View>

               <View style={styles.latestBox}>
                <Text style={styles.latestLabel}>Poslednje dodato</Text>
                <Text style={styles.latestValue} numberOfLines={1}>
                  {latestEntry
                    ? `${latestEntry.translatedWord} (${latestEntry.sourceWord})`
                    : 'Nema unosa'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
       ) : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  statsPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    padding: 18,
    flexDirection: 'row',
     alignItems: 'center',
    justifyContent: 'space-between',
  },
statsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64746F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsValue: {
    marginTop: 4,
    fontSize: 32,
    fontWeight: '800',
    color: '#13221F',
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF7F4',
     },
  statePanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64746F',
     textAlign: 'center',
  },
  languageGrid: {
    gap: 12,
  },
   languageCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    padding: 16,
    gap: 14,
  },
 cardPressed: {
    opacity: 0.88,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
 languageIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#155E63',
  },
  languageCode: {
    color: '#FFFFFF',
    fontSize: 13,
   fontWeight: '800',
    textTransform: 'uppercase',
  },
languageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#13221F',
  },
  languageMeta: {
    marginTop: 4,
    fontSize: 14,
     color: '#64746F',
  },
   latestBox: {
    borderTopWidth: 1,
    borderTopColor: '#D6E0DC',
    paddingTop: 12,
    gap: 4,
  },
  latestLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A9994',
    textTransform: 'uppercase',
     letterSpacing: 0.5,
  },
  latestValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#155E63',
  },
});