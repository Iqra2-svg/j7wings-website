// Firebase configuration and initialization for J7 Wings
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyDwBy46j19VJ_PrPUhWLWZzJnzq96x6bj4',
  authDomain: 'j7wings-1f29d.firebaseapp.com',
  projectId: 'j7wings-1f29d',
  storageBucket: 'j7wings-1f29d.firebasestorage.app',
  messagingSenderId: '171779292763',
  appId: '1:171779292763:web:5a38b98cb4468ba38c897e',
  measurementId: 'G-4EYL9PL4N6',
};

const app = initializeApp(firebaseConfig);

// Export these — every other file in the app will import from here
// instead of initializing Firebase again.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
