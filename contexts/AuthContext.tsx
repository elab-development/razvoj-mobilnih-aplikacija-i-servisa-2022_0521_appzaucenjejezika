import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types/user';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    email: data.email,
    name: data.name,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(async (email: string, name: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    await setDoc(doc(db, 'users', credential.user.uid), {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      createdAt: serverTimestamp(),
    });
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      signIn,
      signUp,
      logout,
    }),
    [user, profile, isLoading, signIn, signUp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}