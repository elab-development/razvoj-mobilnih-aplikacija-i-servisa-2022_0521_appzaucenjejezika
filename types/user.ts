import type { Timestamp } from 'firebase/firestore';

export type UserProfile = {
  email: string;
  name: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};