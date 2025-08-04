/**
 * App State Reducer
 * Manages global application state including navigation, UI state, and form inputs
 */

// Action types
export const APP_ACTIONS = {
  // Navigation actions
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_SELECTED_LIST: 'SET_SELECTED_LIST',
  NAVIGATE_TO_LIST: 'NAVIGATE_TO_LIST',
  NAVIGATE_TO_OVERVIEW: 'NAVIGATE_TO_OVERVIEW',
  
  // Form actions
  SET_NEW_LIST_NAME: 'SET_NEW_LIST_NAME',
  CLEAR_NEW_LIST_NAME: 'CLEAR_NEW_LIST_NAME',
  
  // UI state actions
  SET_LOADING_STATE: 'SET_LOADING_STATE',
  SET_ERROR_STATE: 'SET_ERROR_STATE',
  CLEAR_ERROR_STATE: 'CLEAR_ERROR_STATE',
  
  // Optimistic updates
  OPTIMISTIC_LIST_CREATE_START: 'OPTIMISTIC_LIST_CREATE_START',
  OPTIMISTIC_LIST_CREATE_SUCCESS: 'OPTIMISTIC_LIST_CREATE_SUCCESS',
  OPTIMISTIC_LIST_CREATE_FAILURE: 'OPTIMISTIC_LIST_CREATE_FAILURE',
  
  OPTIMISTIC_LIST_DELETE_START: 'OPTIMISTIC_LIST_DELETE_START',
  OPTIMISTIC_LIST_DELETE_SUCCESS: 'OPTIMISTIC_LIST_DELETE_SUCCESS',
  OPTIMISTIC_LIST_DELETE_FAILURE: 'OPTIMISTIC_LIST_DELETE_FAILURE',
  
  // Reset actions
  RESET_STATE: 'RESET_STATE'
};

// Initial state
export const initialAppState = {
  // Navigation state
  currentPage: 'overview', // 'overview', 'settings', 'analytics', 'theme', 'persistence', 'list'
  selectedList: null,
  
  // Form state
  newListName: '',
  
  // UI state
  isLoading: false,
  error: null,
  
  // Optimistic updates state
  optimisticOperations: {
    creatingList: null, // { tempId, name, timestamp }
    deletingLists: [], // [{ listId, timestamp }]
  },
  
  // History for navigation
  navigationHistory: ['overview']
};

/**
 * App state reducer
 */
export function appReducer(state, action) {
  switch (action.type) {
    // Navigation actions
    case APP_ACTIONS.SET_CURRENT_PAGE: {
      const newHistory = [...state.navigationHistory];
      if (newHistory[newHistory.length - 1] !== action.payload) {
        newHistory.push(action.payload);
        // Keep only last 10 pages in history
        if (newHistory.length > 10) {
          newHistory.shift();
        }
      }
      
      return {
        ...state,
        currentPage: action.payload,
        navigationHistory: newHistory,
        // Clear selected list when navigating away from list page
        selectedList: action.payload === 'list' ? state.selectedList : null
      };
    }
    
    case APP_ACTIONS.SET_SELECTED_LIST: {
      return {
        ...state,
        selectedList: action.payload
      };
    }
    
    case APP_ACTIONS.NAVIGATE_TO_LIST: {
      const newHistory = [...state.navigationHistory];
      if (newHistory[newHistory.length - 1] !== 'list') {
        newHistory.push('list');
        if (newHistory.length > 10) {
          newHistory.shift();
        }
      }
      
      return {
        ...state,
        currentPage: 'list',
        selectedList: action.payload,
        navigationHistory: newHistory
      };
    }
    
    case APP_ACTIONS.NAVIGATE_TO_OVERVIEW: {
      const newHistory = [...state.navigationHistory];
      if (newHistory[newHistory.length - 1] !== 'overview') {
        newHistory.push('overview');
        if (newHistory.length > 10) {
          newHistory.shift();
        }
      }
      
      return {
        ...state,
        currentPage: 'overview',
        selectedList: null,
        navigationHistory: newHistory
      };
    }
    
    // Form actions
    case APP_ACTIONS.SET_NEW_LIST_NAME: {
      return {
        ...state,
        newListName: action.payload
      };
    }
    
    case APP_ACTIONS.CLEAR_NEW_LIST_NAME: {
      return {
        ...state,
        newListName: ''
      };
    }
    
    // UI state actions
    case APP_ACTIONS.SET_LOADING_STATE: {
      return {
        ...state,
        isLoading: action.payload
      };
    }
    
    case APP_ACTIONS.SET_ERROR_STATE: {
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    }
    
    case APP_ACTIONS.CLEAR_ERROR_STATE: {
      return {
        ...state,
        error: null
      };
    }
    
    // Optimistic updates
    case APP_ACTIONS.OPTIMISTIC_LIST_CREATE_START: {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        ...state,
        optimisticOperations: {
          ...state.optimisticOperations,
          creatingList: {
            tempId,
            name: action.payload.name,
            timestamp: Date.now()
          }
        },
        newListName: '' // Clear the input optimistically
      };
    }
    
    case APP_ACTIONS.OPTIMISTIC_LIST_CREATE_SUCCESS: {
      return {
        ...state,
        optimisticOperations: {
          ...state.optimisticOperations,
          creatingList: null
        }
      };
    }
    
    case APP_ACTIONS.OPTIMISTIC_LIST_CREATE_FAILURE: {
      return {
        ...state,
        optimisticOperations: {
          ...state.optimisticOperations,
          creatingList: null
        },
        // Restore the list name on failure
        newListName: state.optimisticOperations.creatingList?.name || state.newListName,
        error: action.payload || 'Failed to create list'
      };
    }
    
    case APP_ACTIONS.OPTIMISTIC_LIST_DELETE_START: {
      const deletingLists = [...state.optimisticOperations.deletingLists];
      deletingLists.push({
        listId: action.payload.listId,
        timestamp: Date.now()
      });
      
      return {
        ...state,
        optimisticOperations: {
          ...state.optimisticOperations,
          deletingLists
        },
        // Clear selected list if it's being deleted
        selectedList: state.selectedList?.id === action.payload.listId ? null : state.selectedList,
        // Navigate to overview if we're on the list being deleted
        currentPage: state.currentPage === 'list' && state.selectedList?.id === action.payload.listId 
          ? 'overview' 
          : state.currentPage
      };
    }
    
    case APP_ACTIONS.OPTIMISTIC_LIST_DELETE_SUCCESS: {
      const deletingLists = state.optimisticOperations.deletingLists.filter(
        item => item.listId !== action.payload.listId
      );
      
      return {
        ...state,
        optimisticOperations: {
          ...state.optimisticOperations,
          deletingLists
        }
      };
    }
    
    case APP_ACTIONS.OPTIMISTIC_LIST_DELETE_FAILURE: {
      const deletingLists = state.optimisticOperations.deletingLists.filter(
        item => item.listId !== action.payload.listId
      );
      
      return {
        ...state,
        optimisticOperations: {
          ...state.optimisticOperations,
          deletingLists
        },
        error: action.payload.error || 'Failed to delete list'
      };
    }
    
    // Reset actions
    case APP_ACTIONS.RESET_STATE: {
      return {
        ...initialAppState,
        // Preserve some state that shouldn't be reset
        navigationHistory: ['overview']
      };
    }
    
    default:
      return state;
  }
}

/**
 * Action creators for better developer experience
 */
export const appActions = {
  // Navigation
  setCurrentPage: (page) => ({
    type: APP_ACTIONS.SET_CURRENT_PAGE,
    payload: page
  }),
  
  setSelectedList: (list) => ({
    type: APP_ACTIONS.SET_SELECTED_LIST,
    payload: list
  }),
  
  navigateToList: (list) => ({
    type: APP_ACTIONS.NAVIGATE_TO_LIST,
    payload: list
  }),
  
  navigateToOverview: () => ({
    type: APP_ACTIONS.NAVIGATE_TO_OVERVIEW
  }),
  
  // Form
  setNewListName: (name) => ({
    type: APP_ACTIONS.SET_NEW_LIST_NAME,
    payload: name
  }),
  
  clearNewListName: () => ({
    type: APP_ACTIONS.CLEAR_NEW_LIST_NAME
  }),
  
  // UI state
  setLoadingState: (isLoading) => ({
    type: APP_ACTIONS.SET_LOADING_STATE,
    payload: isLoading
  }),
  
  setErrorState: (error) => ({
    type: APP_ACTIONS.SET_ERROR_STATE,
    payload: error
  }),
  
  clearErrorState: () => ({
    type: APP_ACTIONS.CLEAR_ERROR_STATE
  }),
  
  // Optimistic updates
  optimisticListCreateStart: (name) => ({
    type: APP_ACTIONS.OPTIMISTIC_LIST_CREATE_START,
    payload: { name }
  }),
  
  optimisticListCreateSuccess: () => ({
    type: APP_ACTIONS.OPTIMISTIC_LIST_CREATE_SUCCESS
  }),
  
  optimisticListCreateFailure: (error) => ({
    type: APP_ACTIONS.OPTIMISTIC_LIST_CREATE_FAILURE,
    payload: error
  }),
  
  optimisticListDeleteStart: (listId) => ({
    type: APP_ACTIONS.OPTIMISTIC_LIST_DELETE_START,
    payload: { listId }
  }),
  
  optimisticListDeleteSuccess: (listId) => ({
    type: APP_ACTIONS.OPTIMISTIC_LIST_DELETE_SUCCESS,
    payload: { listId }
  }),
  
  optimisticListDeleteFailure: (listId, error) => ({
    type: APP_ACTIONS.OPTIMISTIC_LIST_DELETE_FAILURE,
    payload: { listId, error }
  }),
  
  // Reset
  resetState: () => ({
    type: APP_ACTIONS.RESET_STATE
  })
};

/**
 * Selectors for derived state
 */
export const appSelectors = {
  // Navigation selectors
  getCurrentPage: (state) => state.currentPage,
  getSelectedList: (state) => state.selectedList,
  getNavigationHistory: (state) => state.navigationHistory,
  canGoBack: (state) => state.navigationHistory.length > 1,
  getPreviousPage: (state) => {
    const history = state.navigationHistory;
    return history.length > 1 ? history[history.length - 2] : 'overview';
  },
  
  // Form selectors
  getNewListName: (state) => state.newListName,
  isNewListNameValid: (state) => state.newListName.trim().length > 0,
  
  // UI state selectors
  getIsLoading: (state) => state.isLoading,
  getError: (state) => state.error,
  hasError: (state) => state.error !== null,
  
  // Optimistic updates selectors
  getOptimisticOperations: (state) => state.optimisticOperations,
  isCreatingList: (state) => state.optimisticOperations.creatingList !== null,
  isDeletingList: (listId) => (state) => 
    state.optimisticOperations.deletingLists.some(item => item.listId === listId),
  getCreatingListInfo: (state) => state.optimisticOperations.creatingList,
  getDeletingListIds: (state) => 
    state.optimisticOperations.deletingLists.map(item => item.listId)
};