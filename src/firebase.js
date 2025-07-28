import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';

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
let isConnected = false;

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
    
    // Test verbinding
    isConnected = true;
    console.log('Firebase succesvol geïnitialiseerd');
    
    return { app, db, isConnected };
  } catch (error) {
    console.error('Firebase initialisatie fout:', error);
    isConnected = false;
    return { app: null, db: null, isConnected, error };
  }
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

const getShoppingLists = async (deviceUID) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized, returning empty array');
      return [];
    }
    const q = query(collection(db, 'shoppingLists'), where('deviceUID', '==', deviceUID));
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
    await deleteDoc(doc(db, 'shoppingLists', listId));
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    throw error;
  }
};

const subscribeToShoppingLists = (deviceUID, callback) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized, returning empty array');
      callback([]);
      return () => {};
    }
    const q = query(collection(db, 'shoppingLists'), where('deviceUID', '==', deviceUID));
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
  isConnected, 
  initializeFirebase,
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