import { Image } from 'expo-image';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS, type LanguageCode } from '@/lib/languages';
import type { DictionaryEntry, RecognitionConfidence } from '@/types/dictionary';

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function asConfidence(value: unknown): RecognitionConfidence {
  if (value === 'high' || value === 'medium' || value === 'low') {
    return value;
  }

  return 'medium';
}

function asLanguageCode(value: unknown): LanguageCode {
  if (
    typeof value === 'string' &&
    LANGUAGE_OPTIONS.some((language) => language.code === value)
  ) {
    return value as LanguageCode;
  }

  return DEFAULT_LANGUAGE.code;
}

function DictionaryThumbnail({ imagePath }: { imagePath: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDownloadURL(ref(storage, imagePath))
      .then((url) => {
        if (isMounted) {
          setImageUrl(url);
        }
      })
      .catch(() => {
        if (isMounted) {
          setImageUrl(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [imagePath]);

  if (!imageUrl) {
    return (
      <View style={styles.thumbnailFallback}>
        <Text style={styles.thumbnailFallbackText}>?</Text>
      </View>
    );
  }

  return <Image source={{ uri: imageUrl }} style={styles.thumbnail} contentFit="cover" />;
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
        const nextEntries = snapshot.docs.map((document) => {
          const data = document.data();

          return {
            id: document.id,
            sourceWord:
              typeof data.sourceWord === 'string' ? data.sourceWord : 'unknown',
            translatedWord:
              typeof data.translatedWord === 'string'
                ? data.translatedWord
                : 'unknown',
            targetLanguageCode: asLanguageCode(data.targetLanguageCode),
            targetLanguageLabel:
              typeof data.targetLanguageLabel === 'string'
                ? data.targetLanguageLabel
                : 'Engleski',
            description:
              typeof data.description === 'string' ? data.description : '',
            examples: asStringArray(data.examples),
            alternatives: asStringArray(data.alternatives),
            confidence: asConfidence(data.confidence),
            imagePath:
              typeof data.imagePath === 'string' ? data.imagePath : '',
            imageFileName:
              typeof data.imageFileName === 'string' ? data.imageFileName : null,
            imageWidth:
              typeof data.imageWidth === 'number' ? data.imageWidth : null,
            imageHeight:
              typeof data.imageHeight === 'number' ? data.imageHeight : null,
            model: typeof data.model === 'string' ? data.model : undefined,
            createdAtIso:
              typeof data.createdAtIso === 'string' ? data.createdAtIso : undefined,
          } satisfies DictionaryEntry;
        });

        setEntries(nextEntries);
        setError(null);
        setLoading(false);
      },
      () => {
        setError('Recnik nije mogao da se ucita.');
        setLoading(false);
      },
    );
  }, [user]);

  return (
    <AppScreenLayout
      title="Dictionary"
      subtitle="Privatna lista predmeta, prevoda i primera koje ste sacuvali."
    >
      {loading ? (
        <View style={styles.statePanel}>
          <ActivityIndicator color="#155E63" />
          <Text style={styles.stateText}>Ucitavanje recnika...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.statePanel}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && !entries.length ? (
        <View style={styles.statePanel}>
          <Text style={styles.emptyTitle}>Recnik je jos prazan.</Text>
          <Text style={styles.stateText}>
            Skenirajte predmet i pokrenite prepoznavanje da biste dodali prvi unos.
          </Text>
        </View>
      ) : null}

      {entries.map((entry) => (
        <View key={entry.id} style={styles.wordCard}>
          {entry.imagePath ? <DictionaryThumbnail imagePath={entry.imagePath} /> : null}

          <View style={styles.wordContent}>
            <View style={styles.wordHeader}>
              <View style={styles.wordTitleBox}>
                <Text style={styles.translated}>{entry.translatedWord}</Text>
                <Text style={styles.language}>
                  {entry.sourceWord} - {entry.targetLanguageLabel}
                </Text>
              </View>
              <View style={styles.confidencePill}>
                <Text style={styles.confidenceText}>{entry.confidence}</Text>
              </View>
            </View>

            {entry.description ? (
              <Text style={styles.description}>{entry.description}</Text>
            ) : null}

            {entry.examples.length ? (
              <View style={styles.examples}>
                {entry.examples.slice(0, 2).map((example) => (
                  <Text key={example} style={styles.example}>
                    {example}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
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
    alignItems: 'flex-start',
    gap: 14,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#EFF7F4',
  },
  thumbnailFallback: {
    width: 68,
    height: 68,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF7F4',
    borderWidth: 1,
    borderColor: '#D6E0DC',
  },
  thumbnailFallbackText: {
    color: '#64746F',
    fontSize: 18,
    fontWeight: '700',
  },
  wordContent: {
    flex: 1,
    gap: 10,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  wordTitleBox: {
    flex: 1,
  },
  language: {
    marginTop: 4,
    fontSize: 13,
    color: '#64746F',
  },
  translated: {
    fontSize: 22,
    fontWeight: '700',
    color: '#13221F',
  },
  description: {
    fontSize: 14,
    color: '#2F413D',
    lineHeight: 20,
  },
  examples: {
    gap: 6,
  },
  example: {
    fontSize: 13,
    lineHeight: 18,
    color: '#155E63',
  },
  confidencePill: {
    borderRadius: 8,
    backgroundColor: '#EFF7F4',
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#155E63',
    textTransform: 'uppercase',
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
});