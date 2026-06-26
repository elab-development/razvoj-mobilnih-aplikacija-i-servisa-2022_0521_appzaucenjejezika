import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/components/AppScreenLayout';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSelectedImage } from '@/contexts/SelectedImageContext';
import { LANGUAGE_OPTIONS } from '@/lib/languages';

export default function ScanScreen() {
  const {
    setSelectedImage,
    targetLanguage,
    setTargetLanguageCode,
  } = useSelectedImage();
  const [cameraLoading, setCameraLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const openRecognitionScreen = (asset: ImagePicker.ImagePickerAsset) => {
    setSelectedImage({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
    });
    router.push('./recognition');
  };

  const handleOpenCamera = async () => {
    setCameraLoading(true);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Dozvola je potrebna',
          'Dozvolite pristup kameri da biste slikali predmet.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        openRecognitionScreen(result.assets[0]);
      }
    } catch {
      Alert.alert('Greska', 'Kamera nije mogla da se otvori.');
    } finally {
      setCameraLoading(false);
    }
  };

  const handlePickFromGallery = async () => {
    setGalleryLoading(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Dozvola je potrebna',
          'Dozvolite pristup galeriji da biste izabrali sliku.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        openRecognitionScreen(result.assets[0]);
      }
    } catch {
      Alert.alert('Greska', 'Galerija nije mogla da se otvori.');
    } finally {
      setGalleryLoading(false);
    }
  };

  return (
    <AppScreenLayout
      title="Scan"
      subtitle="Prepoznajte predmet kamerom ili iz galerije, zatim sacuvajte prevod u privatni recnik."
    >
      <View style={styles.scannerPanel}>
        <View style={styles.viewfinder}>
          <Ionicons name="scan-outline" size={54} color="#155E63" />
          <Text style={styles.viewfinderText}>Spremno za prepoznavanje</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Otvori kameru"
            loading={cameraLoading}
            onPress={handleOpenCamera}
          />
          <PrimaryButton
            title="Izaberi iz galerije"
            variant="secondary"
            loading={galleryLoading}
            onPress={handlePickFromGallery}
          />
        </View>
      </View>

      <View style={styles.translationPanel}>
        <Text style={styles.panelLabel}>Jezik prevoda</Text>
        <View style={styles.languageGrid}>
          {LANGUAGE_OPTIONS.map((language) => {
            const isSelected = language.code === targetLanguage.code;

            return (
              <Pressable
                key={language.code}
                style={[
                  styles.languageOption,
                  isSelected && styles.languageOptionSelected,
                ]}
                onPress={() => setTargetLanguageCode(language.code)}
              >
                <Text
                  style={[
                    styles.languageValue,
                    isSelected && styles.languageValueSelected,
                  ]}
                >
                  {language.label}
                </Text>
                {isSelected ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : null}
              </Pressable>
            );
          })}
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
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageOption: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6E0DC',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  languageOptionSelected: {
    backgroundColor: '#155E63',
    borderColor: '#155E63',
  },
  languageValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#155E63',
  },
  languageValueSelected: {
    color: '#FFFFFF',
  },
});