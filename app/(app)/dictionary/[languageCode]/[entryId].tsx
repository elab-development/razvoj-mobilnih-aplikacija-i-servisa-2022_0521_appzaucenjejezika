import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { useAuth } from '@/contexts/AuthContext';
import { isLanguageCode, parseDictionaryEntry } from '@/lib/dictionary';
import { db, storage } from '@/lib/firebase';
import { getLanguageByCode } from '@/lib/languages';
import type { DictionaryEntry } from '@/types/dictionary';

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function DictionaryEntryDetailScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const languageParam = getSingleParam(params.languageCode);
  const entryId = getSingleParam(params.entryId);
  const languageCode = isLanguageCode(languageParam) ? languageParam : null;
  const language = languageCode ? getLanguageByCode(languageCode) : null;
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !entryId) {
      setEntry(null);
      setLoading(false);
      return undefined;
    }

    return onSnapshot(
      doc(db, 'users', user.uid, 'dictionary', entryId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setEntry(null);
          setError('Reč nije pronađena.');
          setLoading(false);
          return;
        }

        const nextEntry = parseDictionaryEntry(snapshot.id, snapshot.data());
        setEntry(nextEntry);
        setError(null);
        setLoading(false);
      },
      () => {
        setError('Detalji reči nisu mogli da se učitaju.');
        setLoading(false);
      },
    );
  }, [entryId, user]);

  useEffect(() => {
    if (!entry?.imagePath) {
      setImageUrl(null);
      return undefined;
    }

    let isMounted = true;

    getDownloadURL(ref(storage, entry.imagePath))
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
  }, [entry?.imagePath]);

  const imageSize = useMemo(() => {
    if (!entry?.imageWidth || !entry.imageHeight) {
      return null;
    }

    return `${Math.round(entry.imageWidth)} x ${Math.round(entry.imageHeight)} px`;
  }, [entry?.imageHeight, entry?.imageWidth]);

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
      title={entry?.translatedWord ?? language.label}
      subtitle="Detalji sačuvane reči, primeri i podaci o slici."
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color="#155E63" />
        <Text style={styles.backText}>Nazad</Text>
      </Pressable>

      {loading ? (
        <View style={styles.statePanel}>
          <ActivityIndicator color="#155E63" />
          <Text style={styles.stateText}>Učitavanje detalja...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.statePanel}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && entry ? (
        <>
          <View style={styles.heroCard}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.heroImage} contentFit="cover" />
            ) : (
              <View style={styles.heroFallback}>
                <Ionicons name="image-outline" size={42} color="#8A9994" />
              </View>
            )}

            <View style={styles.heroContent}>
              <Text style={styles.translated}>{entry.translatedWord}</Text>
              <Text style={styles.source}>{entry.sourceWord}</Text>
              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{entry.targetLanguageLabel}</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{entry.confidence}</Text>
                </View>
              </View>
            </View>
          </View>

          {entry.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Opis</Text>
              <Text style={styles.paragraph}>{entry.description}</Text>
            </View>
          ) : null}

          {entry.examples.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Primeri</Text>
              {entry.examples.map((example) => (
                <View key={example} style={styles.exampleRow}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#155E63" />
                  <Text style={styles.exampleText}>{example}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {entry.alternatives.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Alternativni nazivi</Text>
              <View style={styles.alternativeRow}>
                {entry.alternatives.map((alternative) => (
                  <View key={alternative} style={styles.alternativePill}>
                    <Text style={styles.alternativeText}>{alternative}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Slika i zapis</Text>
            {entry.imageFileName ? (
              <DetailRow label="Fajl" value={entry.imageFileName} />
            ) : null}
            {imageSize ? <DetailRow label="Dimenzije" value={imageSize} /> : null}
            {entry.createdAtIso ? (
              <DetailRow
                label="Dodato"
                value={new Date(entry.createdAtIso).toLocaleDateString()}
              />
            ) : null}
            {entry.model ? <DetailRow label="Model" value={entry.model} /> : null}
          </View>
        </>
      ) : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  backButton: {
    minHeight: 42,
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6E0DC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    color: '#155E63',
    fontSize: 14,
    fontWeight: '700',
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#EFF7F4',
  },
  heroFallback: {
    width: '100%',
    aspectRatio: 4 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF7F4',
  },
  heroContent: {
    padding: 16,
    gap: 8,
  },
  translated: {
    fontSize: 34,
    fontWeight: '800',
    color: '#13221F',
  },
  source: {
    fontSize: 17,
    fontWeight: '700',
    color: '#155E63',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderRadius: 8,
    backgroundColor: '#EFF7F4',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pillText: {
    color: '#155E63',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64746F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2F413D',
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  exampleText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#13221F',
  },
  alternativeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alternativePill: {
    borderRadius: 8,
    backgroundColor: '#EFF7F4',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  alternativeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#155E63',
  },
  detailRow: {
    borderTopWidth: 1,
    borderTopColor: '#D6E0DC',
    paddingTop: 10,
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A9994',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: '#13221F',
  },
});