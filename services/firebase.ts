import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    onAuthStateChanged, 
    User 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot,
    Firestore,
    limit,
    deleteDoc,
    doc
} from 'firebase/firestore';
import { APP_ID } from '../constants';
import { SubmissionResult } from '../types';

// --- ការកំណត់ FIREBASE (FIREBASE CONFIGURATION) ---
const manualConfig = {
  apiKey: "AIzaSyAn4oZIh_Kkp8O8agv-5OqT4rYDKY3Uwgo",
  authDomain: "khmerscore-7aa5a.firebaseapp.com",
  projectId: "khmerscore-7aa5a",
  storageBucket: "khmerscore-7aa5a.firebasestorage.app",
  messagingSenderId: "672034614452",
  appId: "1:672034614452:web:7d2fe478cf1222089e3be1",
  measurementId: "G-H80JX17CLC"
};

// Initialize Firebase
// Prioritize injected config (if available), otherwise use manualConfig
const firebaseConfig = (window as any).__firebase_config 
    ? JSON.parse((window as any).__firebase_config) 
    : manualConfig;

let db: Firestore;
let auth: any;
let isReady = false;

try {
    // Check if config is valid before initializing
    if (firebaseConfig.apiKey) {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        isReady = true;
    } else {
        console.warn("Firebase config is missing.");
    }
} catch (e) {
    console.error("Firebase Init Error:", e);
}

export const initAuth = (): Promise<User> => {
    if (!isReady) return Promise.reject(new Error("មូលដ្ឋានទិន្នន័យមិនទាន់បានតភ្ជាប់។ (Firebase Config Missing)"));
    
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                unsubscribe();
                resolve(user);
            } else {
                // No user is signed in, attempt anonymous sign-in
                try {
                    await signInAnonymously(auth);
                    // The onAuthStateChanged listener will trigger again with the user object
                } catch (e: any) {
                    // Only log real errors, not configuration issues we handle in UI
                    if (e.code !== 'auth/admin-restricted-operation' && e.code !== 'auth/configuration-not-found') {
                        console.error("Auth Error:", e);
                    }
                    unsubscribe();
                    reject(e); // Reject the promise so the UI can handle the specific error
                }
            }
        });
    });
};

// Submit to User's private history
export const submitResult = async (userId: string, result: Omit<SubmissionResult, 'id' | 'timestamp'>) => {
    if (!isReady) throw new Error("Database not connected. Please check API Key.");
    
    const collectionPath = `artifacts/${APP_ID}/users/${userId}/khmer_exercises`;
    
    await addDoc(collection(db, collectionPath), {
        ...result,
        timestamp: new Date().toISOString(),
        appId: APP_ID
    });
};

// Submit to Global shared list (For Summary Table on all devices)
export const submitGlobalResult = async (result: Omit<SubmissionResult, 'id' | 'timestamp'>) => {
    if (!isReady) return; // Silent fail if offline logic handles it, or throw
    
    const collectionPath = `artifacts/${APP_ID}/global_submissions`;
    
    await addDoc(collection(db, collectionPath), {
        ...result,
        timestamp: new Date().toISOString(),
        appId: APP_ID
    });
};

// Delete from Global shared list
export const deleteGlobalResult = async (id: string) => {
    if (!isReady) return;
    const collectionPath = `artifacts/${APP_ID}/global_submissions`;
    await deleteDoc(doc(db, collectionPath, id));
};

export const subscribeToHistory = (userId: string, callback: (data: SubmissionResult[]) => void) => {
    if (!isReady) return () => {};
    
    const collectionPath = `artifacts/${APP_ID}/users/${userId}/khmer_exercises`;
    const q = query(collection(db, collectionPath), orderBy("timestamp", "desc"));
    
    return onSnapshot(q, (snapshot) => {
        const history: SubmissionResult[] = [];
        snapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() } as SubmissionResult);
        });
        callback(history);
    }, (error) => {
        console.error("History fetch error:", error);
    });
};

// Subscribe to Global shared list
export const subscribeToGlobalSubmissions = (callback: (data: SubmissionResult[]) => void) => {
    if (!isReady) return () => {};
    
    const collectionPath = `artifacts/${APP_ID}/global_submissions`;
    // We order by timestamp desc to see newest first
    // Updated limit to 5000 to allow seeing more than 1000 rows
    const q = query(collection(db, collectionPath), orderBy("timestamp", "desc"), limit(5000));
    
    return onSnapshot(q, (snapshot) => {
        const results: SubmissionResult[] = [];
        snapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() } as SubmissionResult);
        });
        callback(results);
    }, (error) => {
        console.error("Global subscription error:", error);
    });
};

export const isFirebaseConfigured = () => {
    // Check if we have a valid config (not the placeholder)
    return isReady;
};