import { useState, useEffect, useCallback } from 'react';
import { 
  getShoppingLists, 
  subscribeToShoppingLists, 
  getCurrentUserID,
  initializeFirebase 
} from '../firebase';
import { useToast } from '../context/ToastContext';

/**
 * Custom hook for managing shopping lists state and Firebase synchronization
 * Extracted from App.jsx to improve code organization and reusability
 */
export const useShoppingLists = () => {
  const [lists, setLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const { error: showError } = useToast();

  /**
   * Initialize Firebase and load shopping lists
   */
  const initializeLists = useCallback(async () => {
    try {
      console.log('Initializing shopping lists...');
      setIsLoading(true);
      setFirebaseError(null);

      const { error } = await initializeFirebase();
      if (error) {
        setFirebaseError(error);
        setIsLoading(false);
        return { error };
      }

      // Wait a moment for authentication to complete
      setTimeout(async () => {
        try {
          const userID = getCurrentUserID();
          if (userID) {
            // Load initial shopping lists from Firebase only
            console.log('Loading lists from Firebase...');
            const initialLists = await getShoppingLists();
            setLists(initialLists);
            console.log('Loaded', initialLists.length, 'lists from Firebase');
            
            // Subscribe to real-time updates - Firebase only, no local caching
            const unsubscribe = subscribeToShoppingLists((firebaseLists) => {
              console.log('Real-time update received:', firebaseLists.length, 'lists');
              // Directly set the Firebase lists - no local merging or caching
              setLists(firebaseLists);
            });
            
            setIsLoading(false);
            return { unsubscribe };
          }
        } catch (error) {
          console.error('Error loading shopping lists:', error);
          setFirebaseError(error);
          setIsLoading(false);
          return { error };
        }
      }, 1000); // Wait for auth to complete
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setFirebaseError(error);
      setIsLoading(false);
      return { error };
    }
  }, []);

  /**
   * Retry connection in case of Firebase errors
   */
  const retryConnection = useCallback(() => {
    setIsLoading(true);
    setFirebaseError(null);
    initializeLists();
  }, [initializeLists]);

  /**
   * Handle shared list URLs
   */
  const handleSharedListFromURL = useCallback(async (currentLists = lists) => {
    const hash = window.location.hash;
    console.log('🌐 URL Hash Handler - Current hash:', hash);
    
    const sharedMatch = hash.match(/^#\/shared\/(.+)$/);
    
    if (sharedMatch) {
      const listId = sharedMatch[1];
      console.log('🌐 URL Hash Handler - Found shared list ID in URL:', listId);
      
      try {
        // Import the required functions dynamically to avoid circular dependencies
        const { getListById, shareListWithUser } = await import('../firebase');
        
        console.log('🌐 Step 1: Fetching list from Firebase...');
        const sharedList = await getListById(listId);
        console.log('🌐 Step 1 Result: Retrieved list:', sharedList);
        
        if (!sharedList) {
          console.error('❌ URL Hash Handler - List not found for ID:', listId);
          showError('Gedeelde lijst niet gevonden of niet toegankelijk');
          window.location.hash = '';
          return;
        }
        
        console.log('🌐 Step 2: Checking user access...');
        const currentUserId = getCurrentUserID();
        const alreadyHasAccess = currentLists.some(list => list.id === listId);
        console.log('🌐 Step 2 Result: Already has access:', alreadyHasAccess);
        
        if (alreadyHasAccess) {
          console.log('ℹ️ URL Hash Handler - User already has access to this list');
          // Clear the hash
          window.location.hash = '';
          return;
        }
        
        console.log('🌐 Step 3: Sharing list with user...');
        await shareListWithUser(listId, currentUserId);
        console.log('✅ URL Hash Handler - List shared successfully!');
        
        // Clear the hash
        window.location.hash = '';
        
      } catch (err) {
        console.error('❌ URL Hash Handler - Error processing shared list from URL:', err);
        
        // Provide more specific error messages based on error type
        if (err.code === 'permission-denied') {
          showError('Geen toegang tot deze lijst. Controleer of de lijst nog bestaat.');
        } else if (err.code === 'not-found') {
          showError('Lijst niet gevonden. De link is mogelijk verlopen.');
        } else if (err.message?.includes('network')) {
          showError('Netwerkfout. Controleer je internetverbinding.');
        } else {
          showError(`Fout bij verwerken van gedeelde lijst: ${err.message || 'Onbekende fout'}`);
        }
        
        // Clear the hash
        window.location.hash = '';
      }
    }
  }, [lists, showError]);

  /**
   * Get lists filtered by ownership
   */
  const getOwnedLists = useCallback(() => {
    return lists.filter(list => list.isCreator);
  }, [lists]);

  /**
   * Get lists shared with the user
   */
  const getSharedLists = useCallback(() => {
    return lists.filter(list => !list.isCreator);
  }, [lists]);

  /**
   * Get total item count across all lists
   */
  const getTotalItemCount = useCallback(() => {
    return lists.reduce((sum, list) => sum + (list.items || []).length, 0);
  }, [lists]);

  /**
   * Get list statistics
   */
  const getListStats = useCallback(() => {
    return {
      total: lists.length,
      owned: getOwnedLists().length,
      shared: getSharedLists().length,
      totalItems: getTotalItemCount()
    };
  }, [lists, getOwnedLists, getSharedLists, getTotalItemCount]);

  return {
    // State
    lists,
    listsLoading,
    isLoading,
    firebaseError,
    
    // Actions
    initializeLists,
    retryConnection,
    handleSharedListFromURL,
    
    // Computed values
    getOwnedLists,
    getSharedLists,
    getTotalItemCount,
    getListStats,
    
    // Utilities
    setLists, // For direct state updates when needed
    setListsLoading
  };
};