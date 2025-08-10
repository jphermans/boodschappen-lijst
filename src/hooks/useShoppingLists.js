import { useState, useEffect, useCallback } from 'react';
import {
  getShoppingLists,
  subscribeToShoppingLists,
  getCurrentUserID,
  initializeFirebase
} from '../firebase';
import { useToast } from '../context/ToastContext';
import errorHandler from '../utils/errorHandler';

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

      const { error } = await errorHandler.withRetry(
        () => initializeFirebase(),
        {
          operation: 'firebase_init',
          context: {},
          maxRetries: 3
        }
      );
      
      if (error) {
        setFirebaseError(error);
        setIsLoading(false);
        errorHandler.logError(error, 'firebase_init');
        return { error };
      }

      // Use proper auth state listener instead of timeout
      const userID = getCurrentUserID();
      if (userID) {
        try {
          console.log('Loading lists from Firebase...');
          const initialLists = await errorHandler.withRetry(
            () => getShoppingLists(),
            {
              operation: 'load_lists',
              context: { userID }
            }
          );
          setLists(initialLists);
          console.log('Loaded', initialLists.length, 'lists from Firebase');
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading shopping lists:', error);
          setFirebaseError(error);
          setIsLoading(false);
          errorHandler.logError(error, 'load_lists', { userID });
          return { error };
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setFirebaseError(error);
      setIsLoading(false);
      errorHandler.logError(error, 'firebase_init');
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
        const sharedList = await errorHandler.withRetry(
          () => getListById(listId),
          {
            operation: 'url_get_shared_list',
            context: { listId },
            maxRetries: 2
          }
        );
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
        await errorHandler.withRetry(
          () => shareListWithUser(listId, currentUserId),
          {
            operation: 'url_share_list',
            context: { listId, currentUserId },
            maxRetries: 2
          }
        );
        console.log('✅ URL Hash Handler - List shared successfully!');
        
        // Clear the hash
        window.location.hash = '';
        
      } catch (err) {
        console.error('❌ URL Hash Handler - Error processing shared list from URL:', err);
        
        const userMessage = errorHandler.getUserMessage(err, 'url_share_list');
        showError(userMessage);
        errorHandler.logError(err, 'url_share_list', { listId });
        
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