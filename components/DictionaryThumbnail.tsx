import { Image } from 'expo-image';
import { getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { storage } from '@/lib/firebase';

type DictionaryThumbnailProps = {
  imagePath: string;
  size?: number;
};

export function DictionaryThumbnail({
  imagePath,
  size = 68,
}: DictionaryThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imagePath) {
      setImageUrl(null);
      return undefined;
    }

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
      <View style={[styles.fallback, { width: size, height: size }]}>
        <Text style={styles.fallbackText}>?</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={[styles.image, { width: size, height: size }]}
      contentFit="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    backgroundColor: '#EFF7F4',
  },
  fallback: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF7F4',
    borderWidth: 1,
    borderColor: '#D6E0DC',
  },
  fallbackText: {
    color: '#64746F',
    fontSize: 18,
    fontWeight: '700',
  },
});