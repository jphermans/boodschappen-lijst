import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Firebase configuratie via environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialiseer Firebase met error handling
let app;
let db = null;
let auth = null;
let isConnected = false;
let currentUser = null;

const initializeFirebase = async () => {
  try {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Firebase configuratie ontbreekt');
    }
    
    console.log('Firebase config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasMeasurementId: !!firebaseConfig.measurementId
    });
    
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Anonymous authentication
    await signInAnonymously(auth);
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        isConnected = true;
        console.log('User signed in anonymously:', user.uid);
      } else {
        currentUser = null;
        isConnected = false;
        console.log('User signed out');
      }
    });
    
    console.log('Firebase succesvol geïnitialiseerd');
    
    return { app, db, auth, isConnected };
  } catch (error) {
    console.error('Firebase initialisatie fout:', error);
    isConnected = false;
    return { app: null, db: null, auth: null, isConnected, error };
  }
};

// Get current user ID (replaces deviceUID)
const getCurrentUserID = () => {
  return currentUser?.uid || null;
};

// Shopping list operations
const createShoppingList = async (listData) => {
  try {
    if (!db) throw new Error('Firebase not initialized');
    const docRef = await addDoc(collection(db, 'shoppingLists'), {
      ...listData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating shopping list:', error);
    throw error;
  }
};

const getShoppingLists = async () => {
  try {
    if (!db || !currentUser) {
      console.warn('Firebase not initialized or user not authenticated, returning empty array');
      return [];
    }
    const q = query(collection(db, 'shoppingLists'), where('deviceUID', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting shopping lists:', error);
    throw error;
  }
};

const updateShoppingList = async (listId, updates) => {
  try {
    if (!db) throw new Error('Firebase not initialized');
    const listRef = doc(db, 'shoppingLists', listId);
    await updateDoc(listRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating shopping list:', error);
    throw error;
  }
};

const deleteShoppingList = async (listId) => {
  try {
    if (!db) throw new Error('Firebase not initialized');
    await deleteDoc(doc(db, 'shoppingLists', listId));
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    throw error;
  }
};

const subscribeToShoppingLists = (callback) => {
  try {
    if (!db || !currentUser) {
      console.warn('Firebase not initialized or user not authenticated, returning empty array');
      callback([]);
      return () => {};
    }
    const q = query(collection(db, 'shoppingLists'), where('deviceUID', '==', currentUser.uid));
    return onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(lists);
    });
  } catch (error) {
    console.error('Error subscribing to shopping lists:', error);
    throw error;
  }
};

// Exporteer functionaliteit
export { 
  app, 
  db, 
  auth,
  isConnected, 
  initializeFirebase,
  getCurrentUserID,
  createShoppingList,
  getShoppingLists,
  updateShoppingList,
  deleteShoppingList,
  subscribeToShoppingLists
};

// Firestore security rules voorbeeld (plaats in firestore.rules):
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Gebruikers kunnen alleen hun eigen lijsten zien en bewerken op basis van deviceUID
    match /shoppingLists/{listId} {
      allow read: if request.auth == null 
        && resource.data.deviceUID == request.auth.uid;
      allow create: if request.auth == null
        && request.resource.data.deviceUID == request.auth.uid;
      allow update, delete: if request.auth == null
        && resource.data.deviceUID == request.auth.uid;
    }
    
    // Vereenvoudigde regels voor ontwikkeling (vervang later met bovenstaande)
    match /shoppingLists/{listId} {
      allow read, write: if true;
    }
  }
}
*/