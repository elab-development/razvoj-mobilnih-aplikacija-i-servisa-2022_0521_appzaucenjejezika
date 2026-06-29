import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { DictionaryThumbnail } from '@/components/DictionaryThumbnail';
import { useAuth } from '@/contexts/AuthContext';
import {
    isLanguageCode,
    parseDictionaryEntry,
    searchDictionaryEntry,
} from '@/lib/dictionary';
import { db } from '@/lib/firebase';
import { getLanguageByCode, type LanguageCode } from '@/lib/languages';
import type { DictionaryEntry } from '@/types/dictionary';

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function DictionaryLanguageScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const languageParam = getSingleParam(params.languageCode);
  const languageCode = isLanguageCode(languageParam) ? languageParam : null;
  const language = languageCode ? getLanguageByCode(languageCode) : null;
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !languageCode) {
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
        const nextEntries = snapshot.docs
          .map((document) => parseDictionaryEntry(document.id, document.data()))
          .filter((entry) => entry.targetLanguageCode === languageCode);

        setEntries(nextEntries);
        setError(null);
        setLoading(false);
      },
      () => {
        setError('Reči za ovaj jezik nisu mogle da se učitaju.');
        setLoading(false);
      },
    );
  }, [languageCode, user]);

  const filteredEntries = useMemo(
    () => entries.filter((entry) => searchDictionaryEntry(entry, searchTerm)),
    [entries, searchTerm],
  );

  const openEntry = (entryId: string, selectedLanguageCode: LanguageCode) => {
    router.push({
      pathname: '/dictionary/[languageCode]/[entryId]',
      params: {
        languageCode: selectedLanguageCode,
        entryId,
      },
    });
  };

  if (!language || !languageCode) {
    return (
      <AppScreenLayout
        title="Dictionary"
         subtitle="Traženi jezik nije pronađen u rečniku."
      >
        <View style={styles.statePanel}>
          <Text style={styles.stateText}>Jezik nije podržan.</Text>
        </View>
      </AppScreenLayout>
    );
  }

  return (
    <AppScreenLayout
      title={language.label}
        subtitle="Pretražite sačuvane predmete za ovaj jezik i otvorite detalje reči."
    >
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#64746F" />
        <TextInput
          style={styles.searchInput}
          placeholder="Pretraži reč, prevod ili primer"
          placeholderTextColor="#8A9994"
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchTerm ? (
          <Pressable style={styles.clearButton} onPress={() => setSearchTerm('')}>
            <Ionicons name="close" size={18} color="#64746F" />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.countPanel}>
         <Text style={styles.countLabel}>Pronađeno</Text>
        <Text style={styles.countValue}>
          {filteredEntries.length} / {entries.length}
        </Text>
      </View>

      {loading ? (
        <View style={styles.statePanel}>
          <ActivityIndicator color="#155E63" />
          <Text style={styles.stateText}>Učitavanje reči...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.statePanel}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && !entries.length ? (
        <View style={styles.statePanel}>
          <Text style={styles.emptyTitle}>Nema sačuvanih reči za ovaj jezik.</Text>
          <Text style={styles.stateText}>
            Na Scan strani izaberite {language.label} i pokrenite prepoznavanje.
          </Text>
        </View>
      ) : null}

      {!loading && !error && entries.length > 0 && !filteredEntries.length ? (
        <View style={styles.statePanel}>
          <Text style={styles.emptyTitle}>Nema rezultata.</Text>
         <Text style={styles.stateText}>Probajte kraću ili drugačiju pretragu.</Text>
        </View>
      ) : null}

      {filteredEntries.map((entry) => (
        <Pressable
          key={entry.id}
          style={({ pressed }) => [styles.wordCard, pressed && styles.cardPressed]}
          onPress={() => openEntry(entry.id, languageCode)}
        >
          <DictionaryThumbnail imagePath={entry.imagePath} />

          <View style={styles.wordContent}>
            <View style={styles.wordHeader}>
              <View style={styles.wordTitleBox}>
                <Text style={styles.translated}>{entry.translatedWord}</Text>
                <Text style={styles.language}>{entry.sourceWord}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8A9994" />
            </View>

            {entry.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {entry.description}
              </Text>
            ) : null}

            {entry.examples[0] ? (
              <Text style={styles.example} numberOfLines={1}>
                {entry.examples[0]}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ))}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    fontSize: 16,
    color: '#13221F',
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF7F4',
  },
  countPanel: {
    backgroundColor: '#EFF7F4',
    borderWidth: 1,
    borderColor: '#BFD1CC',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64746F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#155E63',
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#13221F',
    textAlign: 'center',
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64746F',
    textAlign: 'center',
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cardPressed: {
    opacity: 0.88,
  },
  wordContent: {
    flex: 1,
    gap: 8,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  wordTitleBox: {
    flex: 1,
  },
  translated: {
    fontSize: 22,
    fontWeight: '800',
    color: '#13221F',
  },
  language: {
    marginTop: 3,
    fontSize: 13,
    color: '#64746F',
  },
  description: {
    fontSize: 14,
    color: '#2F413D',
    lineHeight: 20,
  },
  example: {
    fontSize: 13,
    color: '#155E63',
    lineHeight: 18,
  },
});