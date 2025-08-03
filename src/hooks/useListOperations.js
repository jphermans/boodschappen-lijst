import { useState, useCallback } from 'react';
import {
  createShoppingList,
  deleteShoppingList,
  shareListWithUser,
  removeUserFromList,
  canDeleteList,
  getCurrentUserID,
  getListById
} from '../firebase';
import { useToast } from '../context/ToastContext';
import { validateListName } from '../utils/validation';
import { validateQRData } from '../utils/qrSecurity';
import { errorHandler } from '../utils/errorHandler';

/**
 * Custom hook for shopping list CRUD operations
 * Extracted from App.jsx to improve code organization and reusability
 */
export const useListOperations = (lists, userInfo) => {
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isProcessingQRScan, setIsProcessingQRScan] = useState(false);
  const { success, error, info } = useToast();

  /**
   * Create a new shopping list
   */
  const createList = useCallback(async (listName) => {
    const validation = validateListName(listName);
    if (!validation.valid) {
      error(validation.error);
      return { success: false, error: validation.error };
    }

    try {
      const userID = getCurrentUserID();
      if (!userID) {
        const errorMsg = 'Gebruiker niet ingelogd. Probeer de pagina te vernieuwen.';
        error(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!userInfo?.name) {
        const errorMsg = 'Je naam is niet ingesteld. Vernieuw de pagina om je naam in te stellen.';
        error(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      setIsCreatingList(true);
      
      // Enhanced duplicate prevention - check both local and Firebase
      const normalizedName = validation.value.toLowerCase().trim();
      
      // Check local lists first (immediate)
      const localDuplicate = lists.some(list =>
        list.name.toLowerCase().trim() === normalizedName &&
        list.creatorId === userID
      );
      
      if (localDuplicate) {
        console.log("Local duplicate detected for:", validation.value);
        const errorMsg = `⚠️ Lijst "${validation.value}" bestaat al! Kies een andere naam.`;
        error(errorMsg, 2000);
        return { success: false, error: errorMsg };
      }
      
      // Check Firebase lists (async check) with retry
      try {
        const { getShoppingLists } = await import('../firebase');
        const firebaseLists = await errorHandler.withRetry(
          () => getShoppingLists(),
          {
            operation: 'duplicate_check',
            context: { listName: validation.value }
          }
        );
        const firebaseDuplicate = firebaseLists.some(list =>
          list.name.toLowerCase().trim() === normalizedName &&
          list.creatorId === userID
        );
        
        if (firebaseDuplicate) {
          console.log("Firebase duplicate detected for:", validation.value);
          const errorMsg = `⚠️ Lijst "${validation.value}" bestaat al! Kies een andere naam.`;
          error(errorMsg, 2000);
          return { success: false, error: errorMsg };
        }
      } catch (firebaseError) {
        console.warn("Could not check Firebase for duplicates, proceeding with local check only:", firebaseError);
        errorHandler.logError(firebaseError, 'duplicate_check', { listName: validation.value });
      }

      const newListData = {
        name: validation.value,
        items: [],
        creatorName: userInfo.name,
        deviceUID: userID,
        creatorId: userID
      };

      // Create in Firebase with retry mechanism
      console.log("Creating new list in Firebase:", newListData.name);
      const listId = await errorHandler.withRetry(
        () => createShoppingList(newListData),
        {
          operation: 'create_list',
          context: { listName: validation.value }
        }
      );
      
      success(`Lijst "${validation.value}" is aangemaakt! 🎉`);
      return { success: true, listId, listData: newListData };
    } catch (err) {
      console.error('Error creating shopping list:', err);
      const userMessage = errorHandler.getUserMessage(err, 'create_list');
      error(userMessage);
      errorHandler.logError(err, 'create_list', { listName: validation.value });
      return { success: false, error: userMessage };
    } finally {
      setIsCreatingList(false);
    }
  }, [lists, userInfo, error, success]);

  /**
   * Delete a shopping list
   */
  const deleteList = useCallback(async (listId) => {
    const list = lists.find(l => l.id === listId);
    
    if (!list) {
      const errorMsg = 'Lijst niet gevonden';
      error(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    // Check if user can delete this list (only creator can delete)
    if (!canDeleteList(list)) {
      const errorMsg = 'Alleen de maker van de lijst kan deze verwijderen';
      error(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    try {
      const listName = list.name;
      
      // Delete from Firebase with retry mechanism
      console.log("Deleting list:", listName);
      await errorHandler.withRetry(
        () => deleteShoppingList(listId),
        {
          operation: 'delete_list',
          context: { listId, listName }
        }
      );
      
      success(`Lijst "${listName}" is verwijderd.`, 3000);
      return { success: true, listName };
    } catch (err) {
      console.error('Error deleting shopping list:', err);
      const userMessage = errorHandler.getUserMessage(err, 'delete_list');
      error(userMessage, 3000);
      errorHandler.logError(err, 'delete_list', { listId, listName: list.name });
      return { success: false, error: userMessage };
    }
  }, [lists, error, success]);

  /**
   * Share a list with another user
   */
  const shareList = useCallback(async (listId, userIdToShareWith) => {
    try {
      await errorHandler.withRetry(
        () => shareListWithUser(listId, userIdToShareWith),
        {
          operation: 'share_list',
          context: { listId, userIdToShareWith }
        }
      );
      success('Lijst succesvol gedeeld! 🎉');
      return { success: true };
    } catch (err) {
      console.error('Error sharing list:', err);
      const userMessage = errorHandler.getUserMessage(err, 'share_list');
      error(userMessage);
      errorHandler.logError(err, 'share_list', { listId, userIdToShareWith });
      return { success: false, error: userMessage };
    }
  }, [success, error]);

  /**
   * Remove user access from a shared list
   */
  const removeUserFromSharedList = useCallback(async (listId, userIdToRemove) => {
    try {
      await errorHandler.withRetry(
        () => removeUserFromList(listId, userIdToRemove),
        {
          operation: 'remove_user_access',
          context: { listId, userIdToRemove }
        }
      );
      success('Gebruiker toegang ingetrokken');
      return { success: true };
    } catch (err) {
      console.error('Error removing user from list:', err);
      const userMessage = errorHandler.getUserMessage(err, 'remove_user_access');
      error(userMessage);
      errorHandler.logError(err, 'remove_user_access', { listId, userIdToRemove });
      return { success: false, error: userMessage };
    }
  }, [success, error]);

  /**
   * Handle QR code scanning for list sharing
   */
  const handleQRScan = useCallback(async (scannedData) => {
    console.log('🔍 QR Scan Debug - Starting scan process');
    console.log('📱 Scanned data:', scannedData);
    
    // Set flag to prevent hash change interference
    setIsProcessingQRScan(true);
    
    try {
      // Step 1: Validate QR data
      console.log('🔍 Step 1: Validating QR data...');
      const validation = validateQRData(scannedData);
      console.log('✅ Validation result:', validation);
      
      if (!validation.valid) {
        console.error('❌ QR validation failed:', validation.error);
        error(validation.error);
        return { success: false, error: validation.error };
      }

      const { listId } = validation;
      console.log('🔍 Step 2: Extracted list ID:', listId);
      
      // Step 2: Check if the list exists and get its details
      console.log('🔍 Step 3: Fetching list from Firebase...');
      const sharedList = await errorHandler.withRetry(
        () => getListById(listId),
        {
          operation: 'get_shared_list',
          context: { listId },
          maxRetries: 2 // Fewer retries for QR scanning to avoid long waits
        }
      );
      console.log('📋 Retrieved list:', sharedList);
      
      // Handle permission denied case (expected for QR scanning)
      if (sharedList && sharedList.permissionDenied) {
        console.log('🔍 Step 3a: Permission denied - attempting to share list anyway...');
        
        // Check if user already has access to this list
        const currentUserId = getCurrentUserID();
        console.log('👤 Current user ID:', currentUserId);
        
        const alreadyHasAccess = lists.some(list => list.id === listId);
        console.log('🔐 Already has access:', alreadyHasAccess);
        
        if (alreadyHasAccess) {
          console.log('ℹ️ User already has access to this list');
          info('Je hebt al toegang tot deze lijst');
          return { success: true, message: 'Already has access' };
        }
        
        // Try to share the list directly (this might work if the list exists)
        console.log('🔍 Step 4: Attempting to share list with permission denied...');
        try {
          await errorHandler.withRetry(
            () => shareListWithUser(listId, currentUserId),
            {
              operation: 'qr_share_list',
              context: { listId, currentUserId },
              maxRetries: 2
            }
          );
          console.log('✅ List shared successfully despite initial permission denial!');
          success('Lijst succesvol gedeeld! 🎉');
          info('De lijst verschijnt nu in je overzicht', 3000);
          return { success: true, listId };
        } catch (shareError) {
          console.error('❌ Failed to share list:', shareError);
          const userMessage = errorHandler.getUserMessage(shareError, 'qr_share_list');
          error(userMessage);
          errorHandler.logError(shareError, 'qr_share_list', { listId, currentUserId });
          return { success: false, error: userMessage };
        }
      }
      
      if (!sharedList) {
        console.error('❌ List not found in Firebase for ID:', listId);
        const errorMsg = 'Gedeelde lijst niet gevonden of niet toegankelijk';
        error(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      // Step 3: Check if user already has access to this list
      console.log('🔍 Step 4: Checking user access...');
      const currentUserId = getCurrentUserID();
      
      const alreadyHasAccess = lists.some(list => list.id === listId);
      console.log('🔐 Already has access:', alreadyHasAccess);
      
      if (alreadyHasAccess) {
        console.log('ℹ️ User already has access to this list');
        info(`Je hebt al toegang tot lijst "${sharedList.name}"`);
        return { success: true, message: 'Already has access' };
      }
      
      // Step 4: Share the list with the current user
      console.log('🔍 Step 5: Sharing list with user...');
      console.log('🔗 Sharing list ID:', listId, 'with user:', currentUserId);
      
      await errorHandler.withRetry(
        () => shareListWithUser(listId, currentUserId),
        {
          operation: 'qr_share_list',
          context: { listId, currentUserId },
          maxRetries: 2
        }
      );
      console.log('✅ List shared successfully!');
      
      success(`Lijst "${sharedList.name}" is gedeeld met jou! 🎉`);
      info('De lijst verschijnt nu in je overzicht', 3000);
      
      return { success: true, listId, listName: sharedList.name };
      
    } catch (err) {
      console.error('❌ Error processing scanned QR code:', err);
      
      const userMessage = errorHandler.getUserMessage(err, 'qr_scan');
      error(userMessage);
      errorHandler.logError(err, 'qr_scan', { scannedData });
      return { success: false, error: userMessage };
    } finally {
      // Always clear the flag when done
      setIsProcessingQRScan(false);
    }
  }, [lists, error, success, info]);

  return {
    // State
    isCreatingList,
    isProcessingQRScan,
    
    // Operations
    createList,
    deleteList,
    shareList,
    removeUserFromSharedList,
    handleQRScan,
    
    // Utilities
    setIsProcessingQRScan
  };
};