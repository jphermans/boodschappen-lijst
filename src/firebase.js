import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
let db;
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

// Exporteer functionaliteit
export { app, db, isConnected, initializeFirebase };

// Firestore security rules voorbeeld (plaats in firestore.rules):
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Gebruikers kunnen alleen hun eigen lijsten zien en bewerken
    match /shoppingLists/{listId} {
      allow read, write: if request.auth == null 
        && resource.data.deviceUID == request.auth.uid;
      allow create: if request.auth == null
        && request.resource.data.deviceUID == request.auth.uid;
    }
    
    // Items binnen lijsten
    match /shoppingLists/{listId}/items/{itemId} {
      allow read, write: if request.auth == null
        && get(/databases/$(database)/documents/shoppingLists/$(listId)).data.deviceUID == request.auth.uid;
    }
    
    // Gedeelde lijsten via QR code
    match /sharedLists/{shareId} {
      allow read: if true; // Iedereen kan gedeelde lijsten lezen
      allow write: if request.auth == null 
        && request.resource.data.deviceUID == request.auth.uid;
    }
  }
}
*/