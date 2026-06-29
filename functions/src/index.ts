import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import OpenAI from 'openai';

initializeApp();

const db = getFirestore();
const bucket = getStorage().bucket();
const openaiApiKey = defineSecret('OPENAI_API_KEY');
const defaultOpenAIModel = 'gpt-5.4-mini';

const languages = {
  en: { label: 'Engleski', promptName: 'English' },
  de: { label: 'Nemački', promptName: 'German' },
  es: { label: 'Španski', promptName: 'Spanish' },
  fr: { label: 'Francuski', promptName: 'French' },
  it: { label: 'Italijanski', promptName: 'Italian' },
  sr: { label: 'Srpski', promptName: 'Serbian in Latin script' },
} as const;

type LanguageCode = keyof typeof languages;
type Confidence = 'high' | 'medium' | 'low';

type RecognizeImageData = {
  imagePath?: unknown;
  targetLanguageCode?: unknown;
  imageFileName?: unknown;
  imageWidth?: unknown;
  imageHeight?: unknown;
};

type OpenAIRecognitionResult = {
  sourceWord: string;
  translatedWord: string;
  description: string;
  examples: string[];
  alternatives: string[];
  confidence: Confidence;
};

const recognitionSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'sourceWord',
    'translatedWord',
    'description',
    'examples',
    'alternatives',
    'confidence',
  ],
  properties: {
    sourceWord: {
      type: 'string',
      description: 'Simple English dictionary headword for the main object.',
    },
    translatedWord: {
      type: 'string',
      description:
        'The object name translated into the requested target language.',
    },
    description: {
      type: 'string',
      description:
        'One short target-language description of the detected object.',
    },
    examples: {
      type: 'array',
      minItems: 3,
      maxItems: 4,
      items: {
        type: 'string',
      },
      description: 'Short natural example sentences in the target language.',
    },
    alternatives: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'string',
      },
      description: 'Alternative names or synonyms in the target language.',
    },
    confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
    },
  },
} as const;

function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && value in languages;
}

function validateImagePath(uid: string, value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'Image path is required.');
  }

  const imagePath = value.trim();
  const expectedPrefix = `users/${uid}/scans/`;

  if (!imagePath.startsWith(expectedPrefix)) {
    throw new HttpsError(
      'permission-denied',
      'This image does not belong to you.',
    );
  }

  return imagePath;
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function optionalNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function cleanString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function cleanStringArray(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function cleanConfidence(value: unknown): Confidence {
  if (value === 'high' || value === 'medium' || value === 'low') {
    return value;
  }

  return 'medium';
}

function parseRecognitionResult(rawOutput: string): OpenAIRecognitionResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawOutput);
  } catch {
    throw new HttpsError('internal', 'AI response could not be parsed.');
  }

  const parsedObject = parsed as Record<string, unknown>;
  const translatedWord = cleanString(parsedObject.translatedWord, 'unknown');
  const sourceWord = cleanString(parsedObject.sourceWord, translatedWord);
  const examples = cleanStringArray(parsedObject.examples, 4);

  return {
    sourceWord,
    translatedWord,
    description: cleanString(parsedObject.description, translatedWord),
    examples: examples.length ? examples : [translatedWord],
    alternatives: cleanStringArray(parsedObject.alternatives, 4),
    confidence: cleanConfidence(parsedObject.confidence),
  };
}

export const recognizeImage = onCall(
  {
    region: 'europe-west1',
    timeoutSeconds: 90,
    memory: '512MiB',
    secrets: [openaiApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const uid = request.auth.uid;
    const data = request.data as RecognizeImageData;
    const imagePath = validateImagePath(uid, data.imagePath);

    if (!isLanguageCode(data.targetLanguageCode)) {
      throw new HttpsError('invalid-argument', 'Unsupported target language.');
    }

    const language = languages[data.targetLanguageCode];
    const imageFileName = optionalString(data.imageFileName);
    const imageWidth = optionalNumber(data.imageWidth);
    const imageHeight = optionalNumber(data.imageHeight);
    const apiKey = openaiApiKey.value();
    const model = process.env.OPENAI_MODEL?.trim() || defaultOpenAIModel;

    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        'OpenAI API key is not configured.',
      );
    }

    try {
      const file = bucket.file(imagePath);
      const [metadata] = await file.getMetadata();
      const size = Number(metadata.size ?? 0);

      if (size > 10 * 1024 * 1024) {
        throw new HttpsError(
          'invalid-argument',
          'Image is too large. Please choose a smaller image.',
        );
      }

      const [imageBuffer] = await file.download();
      const contentType =
        typeof metadata.contentType === 'string'
          ? metadata.contentType
          : 'image/jpeg';
      const imageDataUrl = `data:${contentType};base64,${imageBuffer.toString('base64')}`;

      const openai = new OpenAI({ apiKey });
      const response = await openai.responses.create({
        model,
        max_output_tokens: 700,
        input: [
          {
            role: 'system',
            content:
              'You are VizDict, an image dictionary assistant. Identify the main physical object in the image and return concise dictionary-ready data only.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text:
                  `Target language: ${language.promptName}. ` +
                  'Choose the most important visible object. ' +
                  'Return a simple noun, not a long phrase. ' +
                  'Use Latin script for Serbian. ' +
                  'Examples must be short natural sentences in the target language.',
              },
              {
                type: 'input_image',
                image_url: imageDataUrl,
                detail: 'low',
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'vizdict_recognition',
            strict: true,
            schema: recognitionSchema,
          },
        },
      });

      const result = parseRecognitionResult(response.output_text);
      const createdAtIso = new Date().toISOString();
      const entryRef = db
        .collection('users')
        .doc(uid)
        .collection('dictionary')
        .doc();

      const entry = {
        id: entryRef.id,
        sourceWord: result.sourceWord,
        translatedWord: result.translatedWord,
        targetLanguageCode: data.targetLanguageCode,
        targetLanguageLabel: language.label,
        description: result.description,
        examples: result.examples,
        alternatives: result.alternatives,
        confidence: result.confidence,
        imagePath,
        imageFileName,
        imageWidth,
        imageHeight,
        model,
        createdAtIso,
      };

      await entryRef.set({
        ...entry,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        entryId: entryRef.id,
        entry,
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('recognizeImage failed', error);
      throw new HttpsError('internal', 'Image recognition failed.');
    }
  },
);