import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, query, where, orderBy, onSnapshot, addDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import firebaseConfigRaw from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (firebaseConfigRaw as any).apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfigRaw as any).authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (firebaseConfigRaw as any).projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfigRaw as any).storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfigRaw as any).messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (firebaseConfigRaw as any).appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || (firebaseConfigRaw as any).firestoreDatabaseId
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Error Handling utility as per integration guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth Helpers
let loginInProgress = false;
export const loginWithGoogle = async () => {
  if (loginInProgress) return;
  loginInProgress = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      console.warn('Popup blocked. Please allow popups for this site.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.warn('Popup login was cancelled.');
    } else {
      console.error('Auth Error:', error);
    }
    throw error;
  } finally {
    loginInProgress = false;
  }
};
export const logout = () => signOut(auth);
