import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Fighter } from '../types';

interface AuthContextType {
  user: User | null;
  fighter: Fighter | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Initial fighter check
        const fighterRef = doc(db, 'fighters', user.uid);
        const fighterSnap = await getDoc(fighterRef);

        if (!fighterSnap.exists()) {
          const newFighter: Fighter = {
            uid: user.uid,
            username: user.displayName || 'Anonymous Fighter',
            photoURL: user.photoURL || undefined,
            reputationPoints: 0,
            weightClass: 'Sparring Partner',
            record: { wins: 0, losses: 0, draws: 0 },
            streak: 0,
            lastActive: serverTimestamp(),
          };
          await setDoc(fighterRef, newFighter);
        }

        // Subscribe to fighter updates
        const unsubscribe = onSnapshot(fighterRef, (snap) => {
          if (snap.exists()) {
            setFighter(snap.data() as Fighter);
          }
        });

        setLoading(false);
        return unsubscribe;
      } else {
        setFighter(null);
        setLoading(false);
      }
    });
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, fighter, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
