import type { Persistence } from '@firebase/auth';
import 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}