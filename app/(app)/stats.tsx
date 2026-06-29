import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { useAuth } from '@/contexts/AuthContext';
import { parseDictionaryEntry } from '@/lib/dictionary';
import { db } from '@/lib/firebase';
import { LANGUAGE_OPTIONS } from '@/lib/languages';
import type { DictionaryEntry } from '@/types/dictionary';

type MonthStat = {
  key: string;
  label: string;
  count: number;
};

function getEntryDate(entry: DictionaryEntry) {
  if (!entry.createdAtIso) {
    return null;
  }

  const date = new Date(entry.createdAtIso);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString('sr-Latn-RS', {
    month: 'short',
    year: '2-digit',
  });
}

function getLastMonths(count: number) {
  const months: MonthStat[] = [];
  const cursor = new Date();
  cursor.setDate(1);

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - index, 1);

    months.push({
      key: getMonthKey(date),
      label: getMonthLabel(date),
      count: 0,
    });
  }

  return months;
}

function buildMonthlyStats(entries: DictionaryEntry[]) {
  const months = getLastMonths(6);
  const counts = new Map(months.map((month) => [month.key, 0]));

  entries.forEach((entry) => {
    const date = getEntryDate(entry);

    if (!date) {
      return;
    }

    const key = getMonthKey(date);

    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  return months.map((month) => ({
    ...month,
    count: counts.get(month.key) ?? 0,
  }));
}

function buildLanguageStats(entries: DictionaryEntry[]) {
  const total = entries.length;

  return LANGUAGE_OPTIONS.map((language) => {
    const count = entries.filter(
      (entry) => entry.targetLanguageCode === language.code,
    ).length;

    return {
      language,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  }).sort((first, second) => second.count - first.count);
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={22} color="#155E63" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function UsageStatsScreen() {
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
        setError('Statistika nije mogla da se učita.');
        setLoading(false);
      },
    );
  }, [user]);

  const languageStats = useMemo(() => buildLanguageStats(entries), [entries]);
  const monthlyStats = useMemo(() => buildMonthlyStats(entries), [entries]);
  const activeLanguages = languageStats.filter((stat) => stat.count > 0).length;
  const currentMonthKey = getMonthKey(new Date());
  const thisMonthCount =
    monthlyStats.find((month) => month.key === currentMonthKey)?.count ?? 0;
  const maxMonthlyCount = Math.max(...monthlyStats.map((month) => month.count), 1);
  const topLanguage = languageStats.find((stat) => stat.count > 0);

  return (
    <AppScreenLayout
      title="Usage Stats"
      subtitle="Pregled rečnika po jezicima, mesecima i ukupnom korišćenju."
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color="#155E63" />
        <Text style={styles.backText}>Nazad</Text>
      </Pressable>

      {loading ? (
        <View style={styles.statePanel}>
          <ActivityIndicator color="#155E63" />
          <Text style={styles.stateText}>Učitavanje statistike...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.statePanel}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error ? (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              label="Ukupno reči"
              value={String(entries.length)}
              icon="library-outline"
            />
            <StatCard
              label="Aktivni jezici"
              value={String(activeLanguages)}
              icon="language-outline"
            />
            <StatCard
              label="Ovaj mesec"
              value={String(thisMonthCount)}
              icon="calendar-outline"
            />
            <StatCard
              label="Najviše koristite"
              value={topLanguage?.language.label ?? '-'}
              icon="trophy-outline"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Po jezicima</Text>
              <Ionicons name="bar-chart-outline" size={20} color="#155E63" />
            </View>

            {languageStats.map((stat) => (
              <View key={stat.language.code} style={styles.languageRow}>
                <View style={styles.languageLabelBox}>
                  <View style={styles.languageBadge}>
                    <Text style={styles.languageBadgeText}>{stat.language.code}</Text>
                  </View>
                  <View style={styles.languageTextBox}>
                    <Text style={styles.languageName}>{stat.language.label}</Text>
                    <Text style={styles.languageCount}>
                      {stat.count === 1 ? '1 reč' : `${stat.count} reči`}
                    </Text>
                  </View>
                </View>

                <View style={styles.languageProgressBox}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.max(stat.percentage, stat.count ? 8 : 0)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.percentageText}>{stat.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Poslednjih 6 meseci</Text>
              <Ionicons name="trending-up-outline" size={20} color="#155E63" />
            </View>

            <View style={styles.monthChart}>
              {monthlyStats.map((month) => {
                const barHeight = 18 + Math.round((month.count / maxMonthlyCount) * 88);

                return (
                  <View key={month.key} style={styles.monthColumn}>
                    <View style={styles.monthBarBox}>
                      <View style={[styles.monthBar, { height: barHeight }]} />
                    </View>
                    <Text style={styles.monthCount}>{month.count}</Text>
                    <Text style={styles.monthLabel} numberOfLines={1}>
                      {month.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kratak pregled</Text>
              <Ionicons name="sparkles-outline" size={20} color="#155E63" />
            </View>

            <Text style={styles.summaryText}>
              {entries.length
                             ? `Sačuvano je ${entries.length} reči kroz ${activeLanguages} jezika. Najaktivniji jezik je ${topLanguage?.language.label ?? 'n/a'}.`
                : 'Još nema sačuvanih reči. Kada dodate prve predmete, ovde će se pojaviti pregled korišćenja.'}
            </Text>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    minWidth: 148,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF7F4',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#13221F',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64746F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#13221F',
  },
  languageRow: {
    gap: 10,
  },
  languageLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  languageBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#155E63',
  },
  languageBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  languageTextBox: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#13221F',
  },
  languageCount: {
    marginTop: 2,
    fontSize: 13,
    color: '#64746F',
  },
  languageProgressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#EFF7F4',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#155E63',
  },
  percentageText: {
    width: 42,
    fontSize: 12,
    fontWeight: '800',
    color: '#155E63',
    textAlign: 'right',
  },
  monthChart: {
    minHeight: 158,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  monthColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  monthBarBox: {
    height: 112,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  monthBar: {
    width: '70%',
    minWidth: 16,
    maxWidth: 34,
    borderRadius: 8,
    backgroundColor: '#155E63',
  },
  monthCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#13221F',
  },
  monthLabel: {
    fontSize: 11,
    color: '#64746F',
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2F413D',
  },
});