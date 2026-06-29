import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedImage } from '@/contexts/SelectedImageContext';
import { recognizeImage, uploadSelectedImage } from '@/lib/recognition';
import type { DictionaryEntry } from '@/types/dictionary';

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

   return 'Prepoznavanje nije uspelo. Pokušajte ponovo.'; 
}

export default function RecognitionScreen() {
  const { user } = useAuth();
  const { selectedImage, targetLanguage } = useSelectedImage();
  const [recognitionResult, setRecognitionResult] = useState<DictionaryEntry | null>(
    null,
  );
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);

  const imageUri = selectedImage?.uri ?? null;
  const imageSize = useMemo(() => {
    const width = selectedImage?.width;
    const height = selectedImage?.height;

    if (
      typeof width !== 'number' ||
      typeof height !== 'number' ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      return null;
    }

    return `${Math.round(width)} x ${Math.round(height)} px`;
  }, [selectedImage?.height, selectedImage?.width]);

  const handleRecognizeImage = async () => {
    if (!user) {
       Alert.alert('Greška', 'Morate biti prijavljeni da sačuvate reč u rečnik.');
      return;
    }

    if (!selectedImage) {
    Alert.alert('Greška', 'Nema slike za prepoznavanje.');
      return;
    }

    setRecognizing(true);

    try {
      let imagePath = uploadedImagePath;

      if (!imagePath) {
        const upload = await uploadSelectedImage(user.uid, selectedImage);
        imagePath = upload.imagePath;
        setUploadedImagePath(imagePath);
      }

      const response = await recognizeImage({
        imagePath,
        targetLanguageCode: targetLanguage.code,
        imageFileName: selectedImage.fileName ?? null,
        imageWidth: selectedImage.width ?? null,
        imageHeight: selectedImage.height ?? null,
      });

      setRecognitionResult(response.entry);
    } catch (error) {
      Alert.alert('Greška', getErrorMessage(error));
    } finally {
      setRecognizing(false);
    }
  };

  if (!imageUri) {
    return (
      <AppScreenLayout
        title="Recognition"
        subtitle="Slika nije prosleđena. Vratite se na skeniranje i izaberite novu sliku."
      >
        <View style={styles.emptyPanel}>
          <Ionicons name="image-outline" size={44} color="#8A9994" />
          <Text style={styles.emptyText}>Nema slike za prikaz.</Text>
        </View>

        <PrimaryButton title="Nazad na skeniranje" onPress={() => router.back()} />
      </AppScreenLayout>
    );
  }

  return (
    <AppScreenLayout
      title="Recognition"
      subtitle={`Prepoznajte predmet i sačuvajte naziv, prevod i primere u privatni rečnik. Izabrani jezik: ${targetLanguage.label}.`}
    >
      <View style={styles.previewPanel}>
        <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />

        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>Slika</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {selectedImage?.fileName ?? 'selected-image'}
          </Text>

          {imageSize ? (
            <>
              <Text style={styles.metaLabel}>Dimenzije</Text>
              <Text style={styles.metaValue}>{imageSize}</Text>
            </>
          ) : null}
        </View>
      </View>

      <PrimaryButton
        title={recognitionResult ? 'Prepoznaj ponovo' : 'Prepoznaj predmet'}
        loading={recognizing}
        onPress={handleRecognizeImage}
      />

      {recognitionResult ? (
        <View style={styles.resultPanel}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle" size={22} color="#155E63" />
            <Text style={styles.resultEyebrow}>Sačuvano u rečnik</Text>
          </View>

          <View>
            <Text style={styles.translatedWord}>
              {recognitionResult.translatedWord}
            </Text>
            <Text style={styles.sourceWord}>
              {recognitionResult.sourceWord} - {recognitionResult.targetLanguageLabel}
            </Text>
          </View>

          <Text style={styles.description}>{recognitionResult.description}</Text>

          <View style={styles.examplesBox}>
            <Text style={styles.sectionLabel}>Primeri</Text>
            {recognitionResult.examples.map((example) => (
              <Text key={example} style={styles.exampleText}>
                {example}
              </Text>
            ))}
          </View>

          {recognitionResult.alternatives.length ? (
            <View style={styles.alternativesBox}>
              <Text style={styles.sectionLabel}>Alternativni nazivi</Text>
              <View style={styles.alternativesRow}>
                {recognitionResult.alternatives.map((alternative) => (
                  <View key={alternative} style={styles.alternativePill}>
                    <Text style={styles.alternativeText}>{alternative}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <PrimaryButton
            title="Otvori rečnik"
            variant="secondary"
            onPress={() => router.push('./dictionary')}
          />
        </View>
      ) : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  previewPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#EFF7F4',
  },
  metaBox: {
    padding: 16,
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A9994',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 16,
    color: '#13221F',
    marginBottom: 8,
  },
  resultPanel: {
    backgroundColor: '#EFF7F4',
    borderWidth: 1,
    borderColor: '#BFD1CC',
    borderRadius: 8,
    padding: 14,
    gap: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#155E63',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  translatedWord: {
    fontSize: 30,
    fontWeight: '800',
    color: '#13221F',
  },
  sourceWord: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: '#155E63',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2F413D',
  },
  examplesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6E0DC',
    padding: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64746F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#13221F',
  },
  alternativesBox: {
    gap: 8,
  },
  alternativesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alternativePill: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  alternativeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#155E63',
  },
  emptyPanel: {
    minHeight: 260,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64746F',
  },
});