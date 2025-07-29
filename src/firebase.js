import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
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
    
    console.log('Firebase app initialized, attempting anonymous sign in...');
    
    // Anonymous authentication
    const userCredential = await signInAnonymously(auth);
    console.log('Anonymous sign in successful:', userCredential.user.uid);
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        isConnected = true;
        console.log('Auth state changed - User signed in:', user.uid);
        console.log('Database reference:', db ? 'OK' : 'NULL');
      } else {
        currentUser = null;
        isConnected = false;
        console.log('Auth state changed - User signed out');
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
    if (!currentUser) throw new Error('User not authenticated');
    
    console.log('Creating shopping list with data:', listData);
    console.log('Current user UID:', currentUser.uid);
    
    const docRef = await addDoc(collection(db, 'shoppingLists'), {
      ...listData,
      deviceUID: currentUser.uid, // Use deviceUID to match your Firebase rules
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Shopping list created with ID:', docRef.id);
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
    
    console.log('Querying shopping lists for user:', currentUser.uid);
    
    // Query using deviceUID as that's what your Firebase rules expect
    const q = query(collection(db, 'shoppingLists'), where('deviceUID', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    
    console.log('Found', querySnapshot.docs.length, 'shopping lists');
    
    const lists = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isCreator: true
    }));
    
    console.log('Returning lists:', lists);
    return lists;
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

// Share a list with another user
const shareListWithUser = async (listId, userIdToShareWith) => {
  try {
    if (!db) throw new Error('Firebase not initialized');
    const listRef = doc(db, 'shoppingLists', listId);
    
    // Get current list data
    const listDoc = await getDoc(listRef);
    if (!listDoc.exists()) {
      throw new Error('List not found');
    }
    
    const listData = listDoc.data();
    const currentSharedWith = listData.sharedWith || [];
    
    // Add user to sharedWith array if not already present
    if (!currentSharedWith.includes(userIdToShareWith)) {
      await updateDoc(listRef, {
        sharedWith: [...currentSharedWith, userIdToShareWith],
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error sharing list:', error);
    throw error;
  }
};

// Remove user access from a shared list
const removeUserFromList = async (listId, userIdToRemove) => {
  try {
    if (!db) throw new Error('Firebase not initialized');
    const listRef = doc(db, 'shoppingLists', listId);
    
    // Get current list data
    const listDoc = await getDoc(listRef);
    if (!listDoc.exists()) {
      throw new Error('List not found');
    }
    
    const listData = listDoc.data();
    const currentSharedWith = listData.sharedWith || [];
    
    // Remove user from sharedWith array
    const updatedSharedWith = currentSharedWith.filter(userId => userId !== userIdToRemove);
    
    await updateDoc(listRef, {
      sharedWith: updatedSharedWith,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error removing user from list:', error);
    throw error;
  }
};

// Check if current user can delete a list (only creator can delete)
const canDeleteList = (list) => {
  return list.deviceUID === currentUser?.uid;
};

// Get a single list by ID (for sharing functionality)
const getListById = async (listId) => {
  try {
    if (!db) throw new Error('Firebase not initialized');
    const listDoc = await getDoc(doc(db, 'shoppingLists', listId));
    if (listDoc.exists()) {
      const data = listDoc.data();
      return {
        id: listDoc.id,
        ...data,
        isCreator: data.creatorId === currentUser?.uid || data.userId === currentUser?.uid
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting list by ID:', error);
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
    
    console.log('Subscribing to shopping lists for user:', currentUser.uid);
    
    // Subscribe using deviceUID as that's what your Firebase rules expect
    const q = query(collection(db, 'shoppingLists'), where('deviceUID', '==', currentUser.uid));
    return onSnapshot(q, (snapshot) => {
      console.log('Subscription update: found', snapshot.docs.length, 'lists');
      const lists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isCreator: true
      }));
      console.log('Subscription returning lists:', lists);
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
  subscribeToShoppingLists,
  shareListWithUser,
  removeUserFromList,
  canDeleteList,
  getListById
};

// Firestore security rules voorbeeld (plaats in firestore.rules):
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Shopping lists with creator permissions and sharing support
    match /shoppingLists/{listId} {
      // Users can read lists they created or are shared with
      allow read: if request.auth != null
        && (resource.data.creatorId == request.auth.uid
            || request.auth.uid in resource.data.sharedWith);
      
      // Only authenticated users can create lists
      allow create: if request.auth != null
        && request.resource.data.creatorId == request.auth.uid
        && request.resource.data.name is string
        && request.resource.data.name.size() <= 100
        && request.resource.data.items is list
        && request.resource.data.sharedWith is list;
      
      // Users can update lists they created or are shared with
      allow update: if request.auth != null
        && (resource.data.creatorId == request.auth.uid
            || request.auth.uid in resource.data.sharedWith)
        && request.resource.data.creatorId == resource.data.creatorId; // Prevent changing creator
      
      // Only the creator can delete lists
      allow delete: if request.auth != null
        && resource.data.creatorId == request.auth.uid;
    }
  }
}
*/