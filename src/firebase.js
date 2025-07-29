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
      creatorId: currentUser?.uid, // Track who created the list
      sharedWith: [], // Array of user IDs who have access
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
    
    // Get all lists for this user - try multiple field names to be compatible with existing data
    const queries = [];
    
    // Try different possible field names that might exist in your data
    const possibleFields = ['userId', 'creatorId', 'userID', 'user'];
    
    for (const field of possibleFields) {
      try {
        const q = query(collection(db, 'shoppingLists'), where(field, '==', currentUser.uid));
        queries.push(getDocs(q));
      } catch (err) {
        // Field might not exist, continue
        console.log(`Field ${field} not found, trying next...`);
      }
    }
    
    // Also try to get all lists (in case there's no user field filtering)
    try {
      queries.push(getDocs(collection(db, 'shoppingLists')));
    } catch (err) {
      console.log('Could not get all lists');
    }
    
    const snapshots = await Promise.all(queries);
    const allLists = [];
    const seenIds = new Set();
    
    snapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          const data = doc.data();
          // Check if this list belongs to current user or has no user restriction
          const belongsToUser = !data.userId ||
                               data.userId === currentUser.uid ||
                               data.creatorId === currentUser.uid ||
                               data.userID === currentUser.uid ||
                               data.user === currentUser.uid;
          
          if (belongsToUser) {
            allLists.push({
              id: doc.id,
              ...data,
              isCreator: true
            });
            seenIds.add(doc.id);
          }
        }
      });
    });
    
    return allLists;
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
  return list.creatorId === currentUser?.uid || list.userId === currentUser?.uid;
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
    
    // Subscribe to all lists and filter on client side to be compatible with existing data
    const unsubscribe = onSnapshot(collection(db, 'shoppingLists'), (snapshot) => {
      const allLists = [];
      const seenIds = new Set();
      
      snapshot.docs.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          const data = doc.data();
          // Check if this list belongs to current user or has no user restriction
          const belongsToUser = !data.userId ||
                               data.userId === currentUser.uid ||
                               data.creatorId === currentUser.uid ||
                               data.userID === currentUser.uid ||
                               data.user === currentUser.uid;
          
          if (belongsToUser) {
            allLists.push({
              id: doc.id,
              ...data,
              isCreator: true
            });
            seenIds.add(doc.id);
          }
        }
      });
      
      callback(allLists);
    });
    
    return unsubscribe;
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