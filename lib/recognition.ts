import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import type { SelectedImage } from '@/contexts/SelectedImageContext';
import { functions, storage } from '@/lib/firebase';
import type {
    RecognizeImageRequest,
    RecognizeImageResponse,
} from '@/types/dictionary';

function createScanId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getExtension(fileName?: string | null, mimeType?: string | null) {
  const fileExtension = fileName?.split('.').pop()?.toLowerCase();

  if (fileExtension && /^[a-z0-9]+$/.test(fileExtension)) {
    return fileExtension === 'jpeg' ? 'jpg' : fileExtension;
  }

  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  return 'jpg';
}

function getContentType(mimeType?: string | null) {
  if (mimeType?.startsWith('image/')) {
    return mimeType;
  }

  return 'image/jpeg';
}

async function uriToBlob(uri: string) {
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error('Image file could not be loaded.');
  }

  return response.blob();
}

export async function uploadSelectedImage(uid: string, image: SelectedImage) {
  const contentType = getContentType(image.mimeType);
  const extension = getExtension(image.fileName, contentType);
  const imagePath = `users/${uid}/scans/${createScanId()}.${extension}`;
  const imageRef = ref(storage, imagePath);
  const blob = await uriToBlob(image.uri);

  try {
    await uploadBytes(imageRef, blob, {
      contentType,
      customMetadata: {
        ownerUid: uid,
        originalFileName: image.fileName ?? 'selected-image',
      },
    });
  } finally {
    (blob as Blob & { close?: () => void }).close?.();
  }

  const downloadUrl = await getDownloadURL(imageRef);

  return {
    imagePath,
    downloadUrl,
  };
}

const recognizeImageCallable = httpsCallable<
  RecognizeImageRequest,
  RecognizeImageResponse
>(functions, 'recognizeImage');

export async function recognizeImage(data: RecognizeImageRequest) {
  const response = await recognizeImageCallable(data);

  return response.data;
}