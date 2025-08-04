/**
 * Enhanced App State Hook
 * Combines app and list reducers with persistence and optimistic updates
 */

import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { appReducer, initialAppState, appActions, appSelectors } from '../reducers/appReducer';
import { listReducer, initialListState, listActions, listSelectors } from '../reducers/listReducer';
import statePersistence, { withPersistence } from '../utils/statePersistence';
import errorHandler from '../utils/errorHandler';

/**
 * Custom hook for enhanced app state management
 */
export function useAppState() {
  // Create persistence-aware reducers
  const persistentAppReducer = useMemo(
    () => withPersistence(appReducer, 'app'),
    []
  );
  
  const persistentListReducer = useMemo(
    () => withPersistence(listReducer, 'list'),
    []
  );
  
  // Initialize state with persistence
  const [appState, dispatchApp] = useReducer(
    persistentAppReducer,
    initialAppState,
    (initial) => statePersistence.restoreAppState(initial)
  );
  
  const [listState, dispatchList] = useReducer(
    persistentListReducer,
    initialListState,
    (initial) => statePersistence.restoreListState(initial)
  );
  
  // Initialize persistence on mount
  useEffect(() => {
    statePersistence.initialize();
    
    // Cleanup on unmount
    return () => {
      statePersistence.cleanup();
    };
  }, []);
  
  // App state actions with error handling
  const appStateActions = useMemo(() => ({
    // Navigation actions
    setCurrentPage: useCallback((page) => {
      try {
        dispatchApp(appActions.setCurrentPage(page));
      } catch (error) {
        console.error('Failed to set current page:', error);
        errorHandler.logError(error, 'app_state_navigation', { page });
      }
    }, []),
    
    setSelectedList: useCallback((list) => {
      try {
        dispatchApp(appActions.setSelectedList(list));
      } catch (error) {
        console.error('Failed to set selected list:', error);
        errorHandler.logError(error, 'app_state_selection', { listId: list?.id });
      }
    }, []),
    
    navigateToList: useCallback((list) => {
      try {
        dispatchApp(appActions.navigateToList(list));
      } catch (error) {
        console.error('Failed to navigate to list:', error);
        errorHandler.logError(error, 'app_state_navigate_list', { listId: list?.id });
      }
    }, []),
    
    navigateToOverview: useCallback(() => {
      try {
        dispatchApp(appActions.navigateToOverview());
      } catch (error) {
        console.error('Failed to navigate to overview:', error);
        errorHandler.logError(error, 'app_state_navigate_overview');
      }
    }, []),
    
    // Form actions
    setNewListName: useCallback((name) => {
      try {
        dispatchApp(appActions.setNewListName(name));
      } catch (error) {
        console.error('Failed to set new list name:', error);
        errorHandler.logError(error, 'app_state_form', { nameLength: name?.length });
      }
    }, []),
    
    clearNewListName: useCallback(() => {
      try {
        dispatchApp(appActions.clearNewListName());
      } catch (error) {
        console.error('Failed to clear new list name:', error);
        errorHandler.logError(error, 'app_state_clear_form');
      }
    }, []),
    
    // UI state actions
    setLoadingState: useCallback((isLoading) => {
      try {
        dispatchApp(appActions.setLoadingState(isLoading));
      } catch (error) {
        console.error('Failed to set loading state:', error);
        errorHandler.logError(error, 'app_state_loading', { isLoading });
      }
    }, []),
    
    setErrorState: useCallback((error) => {
      try {
        dispatchApp(appActions.setErrorState(error));
      } catch (err) {
        console.error('Failed to set error state:', err);
        errorHandler.logError(err, 'app_state_error', { originalError: error });
      }
    }, []),
    
    clearErrorState: useCallback(() => {
      try {
        dispatchApp(appActions.clearErrorState());
      } catch (error) {
        console.error('Failed to clear error state:', error);
        errorHandler.logError(error, 'app_state_clear_error');
      }
    }, []),
    
    // Optimistic updates
    optimisticListCreateStart: useCallback((name) => {
      try {
        dispatchApp(appActions.optimisticListCreateStart(name));
      } catch (error) {
        console.error('Failed to start optimistic list creation:', error);
        errorHandler.logError(error, 'app_state_optimistic_create', { name });
      }
    }, []),
    
    optimisticListCreateSuccess: useCallback(() => {
      try {
        dispatchApp(appActions.optimisticListCreateSuccess());
      } catch (error) {
        console.error('Failed to complete optimistic list creation:', error);
        errorHandler.logError(error, 'app_state_optimistic_create_success');
      }
    }, []),
    
    optimisticListCreateFailure: useCallback((error) => {
      try {
        dispatchApp(appActions.optimisticListCreateFailure(error));
      } catch (err) {
        console.error('Failed to handle optimistic list creation failure:', err);
        errorHandler.logError(err, 'app_state_optimistic_create_failure', { originalError: error });
      }
    }, [])
  }), []);
  
  // List state actions with error handling
  const listStateActions = useMemo(() => ({
    // List management
    setLists: useCallback((lists) => {
      try {
        dispatchList(listActions.setLists(lists));
      } catch (error) {
        console.error('Failed to set lists:', error);
        errorHandler.logError(error, 'list_state_set_lists', { listCount: lists?.length });
      }
    }, []),
    
    addList: useCallback((list) => {
      try {
        dispatchList(listActions.addList(list));
      } catch (error) {
        console.error('Failed to add list:', error);
        errorHandler.logError(error, 'list_state_add_list', { listId: list?.id });
      }
    }, []),
    
    updateList: useCallback((listId, updates) => {
      try {
        dispatchList(listActions.updateList(listId, updates));
      } catch (error) {
        console.error('Failed to update list:', error);
        errorHandler.logError(error, 'list_state_update_list', { listId, updateKeys: Object.keys(updates || {}) });
      }
    }, []),
    
    removeList: useCallback((listId) => {
      try {
        dispatchList(listActions.removeList(listId));
      } catch (error) {
        console.error('Failed to remove list:', error);
        errorHandler.logError(error, 'list_state_remove_list', { listId });
      }
    }, []),
    
    // Loading states
    setListsLoading: useCallback((isLoading) => {
      try {
        dispatchList(listActions.setListsLoading(isLoading));
      } catch (error) {
        console.error('Failed to set lists loading:', error);
        errorHandler.logError(error, 'list_state_loading', { isLoading });
      }
    }, []),
    
    setListsError: useCallback((error) => {
      try {
        dispatchList(listActions.setListsError(error));
      } catch (err) {
        console.error('Failed to set lists error:', err);
        errorHandler.logError(err, 'list_state_error', { originalError: error });
      }
    }, []),
    
    clearListsError: useCallback(() => {
      try {
        dispatchList(listActions.clearListsError());
      } catch (error) {
        console.error('Failed to clear lists error:', error);
        errorHandler.logError(error, 'list_state_clear_error');
      }
    }, []),
    
    // Optimistic updates
    optimisticAddList: useCallback((listData) => {
      try {
        dispatchList(listActions.optimisticAddList(listData));
      } catch (error) {
        console.error('Failed to optimistically add list:', error);
        errorHandler.logError(error, 'list_state_optimistic_add', { listName: listData?.name });
      }
    }, []),
    
    optimisticUpdateList: useCallback((listId, updates) => {
      try {
        dispatchList(listActions.optimisticUpdateList(listId, updates));
      } catch (error) {
        console.error('Failed to optimistically update list:', error);
        errorHandler.logError(error, 'list_state_optimistic_update', { listId, updateKeys: Object.keys(updates || {}) });
      }
    }, []),
    
    optimisticRemoveList: useCallback((listId) => {
      try {
        dispatchList(listActions.optimisticRemoveList(listId));
      } catch (error) {
        console.error('Failed to optimistically remove list:', error);
        errorHandler.logError(error, 'list_state_optimistic_remove', { listId });
      }
    }, []),
    
    // Revert optimistic updates
    revertOptimisticAdd: useCallback((tempId) => {
      try {
        dispatchList(listActions.revertOptimisticAdd(tempId));
      } catch (error) {
        console.error('Failed to revert optimistic add:', error);
        errorHandler.logError(error, 'list_state_revert_add', { tempId });
      }
    }, []),
    
    revertOptimisticUpdate: useCallback((listId) => {
      try {
        dispatchList(listActions.revertOptimisticUpdate(listId));
      } catch (error) {
        console.error('Failed to revert optimistic update:', error);
        errorHandler.logError(error, 'list_state_revert_update', { listId });
      }
    }, []),
    
    revertOptimisticRemove: useCallback((listId) => {
      try {
        dispatchList(listActions.revertOptimisticRemove(listId));
      } catch (error) {
        console.error('Failed to revert optimistic remove:', error);
        errorHandler.logError(error, 'list_state_revert_remove', { listId });
      }
    }, []),
    
    // List items
    addItemToList: useCallback((listId, item) => {
      try {
        dispatchList(listActions.addItemToList(listId, item));
      } catch (error) {
        console.error('Failed to add item to list:', error);
        errorHandler.logError(error, 'list_state_add_item', { listId, itemText: item?.text });
      }
    }, []),
    
    updateItemInList: useCallback((listId, itemId, updates) => {
      try {
        dispatchList(listActions.updateItemInList(listId, itemId, updates));
      } catch (error) {
        console.error('Failed to update item in list:', error);
        errorHandler.logError(error, 'list_state_update_item', { listId, itemId, updateKeys: Object.keys(updates || {}) });
      }
    }, []),
    
    removeItemFromList: useCallback((listId, itemId) => {
      try {
        dispatchList(listActions.removeItemFromList(listId, itemId));
      } catch (error) {
        console.error('Failed to remove item from list:', error);
        errorHandler.logError(error, 'list_state_remove_item', { listId, itemId });
      }
    }, []),
    
    toggleItemInList: useCallback((listId, itemId) => {
      try {
        dispatchList(listActions.toggleItemInList(listId, itemId));
      } catch (error) {
        console.error('Failed to toggle item in list:', error);
        errorHandler.logError(error, 'list_state_toggle_item', { listId, itemId });
      }
    }, [])
  }), []);
  
  // Combined selectors
  const selectors = useMemo(() => ({
    // App selectors
    ...Object.keys(appSelectors).reduce((acc, key) => {
      acc[key] = appSelectors[key](appState);
      return acc;
    }, {}),
    
    // List selectors
    ...Object.keys(listSelectors).reduce((acc, key) => {
      const selector = listSelectors[key];
      if (typeof selector === 'function') {
        // Handle parameterized selectors
        acc[key] = (...args) => selector(...args)(listState);
      } else {
        acc[key] = selector(listState);
      }
      return acc;
    }, {}),
    
    // Combined selectors
    getSelectedListData: useMemo(() => {
      const selectedList = appSelectors.getSelectedList(appState);
      if (!selectedList) return null;
      return listSelectors.getListById(selectedList.id)(listState);
    }, [appState.selectedList, listState.lists]),
    
    getNavigationContext: useMemo(() => ({
      currentPage: appSelectors.getCurrentPage(appState),
      selectedList: appSelectors.getSelectedList(appState),
      canGoBack: appSelectors.canGoBack(appState),
      previousPage: appSelectors.getPreviousPage(appState)
    }), [appState.currentPage, appState.selectedList, appState.navigationHistory])
  }), [appState, listState]);
  
  // Utility functions
  const utilities = useMemo(() => ({
    // State persistence
    exportState: useCallback(() => {
      return statePersistence.exportState();
    }, []),
    
    importState: useCallback((data) => {
      return statePersistence.importState(data);
    }, []),
    
    clearPersistedState: useCallback(() => {
      statePersistence.clearPersistedState();
    }, []),
    
    getStorageInfo: useCallback(() => {
      return statePersistence.getStorageInfo();
    }, []),
    
    // State debugging
    getDebugInfo: useCallback(() => ({
      appState,
      listState,
      storageInfo: statePersistence.getStorageInfo(),
      timestamp: new Date().toISOString()
    }), [appState, listState])
  }), [appState, listState]);
  
  return {
    // State
    appState,
    listState,
    
    // Actions
    ...appStateActions,
    ...listStateActions,
    
    // Selectors
    ...selectors,
    
    // Utilities
    ...utilities
  };
}

export default useAppState;