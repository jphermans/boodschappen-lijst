/**
 * List State Reducer
 * Manages shopping lists state including CRUD operations and optimistic updates
 */

// Action types
export const LIST_ACTIONS = {
  // List management
  SET_LISTS: 'SET_LISTS',
  ADD_LIST: 'ADD_LIST',
  UPDATE_LIST: 'UPDATE_LIST',
  REMOVE_LIST: 'REMOVE_LIST',
  
  // List loading states
  SET_LISTS_LOADING: 'SET_LISTS_LOADING',
  SET_LISTS_ERROR: 'SET_LISTS_ERROR',
  CLEAR_LISTS_ERROR: 'CLEAR_LISTS_ERROR',
  
  // Individual list operations
  SET_LIST_LOADING: 'SET_LIST_LOADING',
  SET_LIST_ERROR: 'SET_LIST_ERROR',
  CLEAR_LIST_ERROR: 'CLEAR_LIST_ERROR',
  
  // Optimistic updates for lists
  OPTIMISTIC_ADD_LIST: 'OPTIMISTIC_ADD_LIST',
  OPTIMISTIC_UPDATE_LIST: 'OPTIMISTIC_UPDATE_LIST',
  OPTIMISTIC_REMOVE_LIST: 'OPTIMISTIC_REMOVE_LIST',
  
  // Revert optimistic updates
  REVERT_OPTIMISTIC_ADD: 'REVERT_OPTIMISTIC_ADD',
  REVERT_OPTIMISTIC_UPDATE: 'REVERT_OPTIMISTIC_UPDATE',
  REVERT_OPTIMISTIC_REMOVE: 'REVERT_OPTIMISTIC_REMOVE',
  
  // List items operations
  ADD_ITEM_TO_LIST: 'ADD_ITEM_TO_LIST',
  UPDATE_ITEM_IN_LIST: 'UPDATE_ITEM_IN_LIST',
  REMOVE_ITEM_FROM_LIST: 'REMOVE_ITEM_FROM_LIST',
  TOGGLE_ITEM_IN_LIST: 'TOGGLE_ITEM_IN_LIST',
  REORDER_ITEMS_IN_LIST: 'REORDER_ITEMS_IN_LIST',
  
  // Bulk operations
  CLEAR_COMPLETED_ITEMS: 'CLEAR_COMPLETED_ITEMS',
  MARK_ALL_ITEMS_COMPLETE: 'MARK_ALL_ITEMS_COMPLETE',
  MARK_ALL_ITEMS_INCOMPLETE: 'MARK_ALL_ITEMS_INCOMPLETE',
  
  // Sharing operations
  UPDATE_LIST_SHARING: 'UPDATE_LIST_SHARING',
  ADD_SHARED_USER: 'ADD_SHARED_USER',
  REMOVE_SHARED_USER: 'REMOVE_SHARED_USER',
  
  // Reset
  RESET_LISTS: 'RESET_LISTS'
};

// Initial state
export const initialListState = {
  // Lists data
  lists: [],
  
  // Loading states
  isLoading: false,
  listsLoading: false,
  
  // Error states
  error: null,
  listErrors: {}, // { listId: error }
  
  // Optimistic operations tracking
  optimisticOperations: {
    adding: [], // [{ tempId, listData, timestamp }]
    updating: [], // [{ listId, originalData, timestamp }]
    removing: [] // [{ listId, originalData, timestamp }]
  },
  
  // Statistics cache
  stats: {
    total: 0,
    owned: 0,
    shared: 0,
    totalItems: 0,
    completedItems: 0,
    lastUpdated: null
  }
};

/**
 * Helper function to generate temporary ID
 */
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Helper function to calculate list statistics
 */
const calculateStats = (lists) => {
  const stats = {
    total: lists.length,
    owned: lists.filter(list => list.isCreator).length,
    shared: lists.filter(list => !list.isCreator).length,
    totalItems: 0,
    completedItems: 0,
    lastUpdated: Date.now()
  };
  
  lists.forEach(list => {
    if (list.items) {
      stats.totalItems += list.items.length;
      stats.completedItems += list.items.filter(item => item.completed).length;
    }
  });
  
  return stats;
};

/**
 * Helper function to find list by ID
 */
const findListById = (lists, listId) => {
  return lists.find(list => list.id === listId);
};

/**
 * Helper function to update list in array
 */
const updateListInArray = (lists, listId, updates) => {
  return lists.map(list => 
    list.id === listId 
      ? { ...list, ...updates, updatedAt: new Date() }
      : list
  );
};

/**
 * List state reducer
 */
export function listReducer(state, action) {
  switch (action.type) {
    // List management
    case LIST_ACTIONS.SET_LISTS: {
      const lists = action.payload || [];
      return {
        ...state,
        lists,
        stats: calculateStats(lists),
        isLoading: false,
        error: null
      };
    }
    
    case LIST_ACTIONS.ADD_LIST: {
      const newList = action.payload;
      const lists = [...state.lists, newList];
      return {
        ...state,
        lists,
        stats: calculateStats(lists)
      };
    }
    
    case LIST_ACTIONS.UPDATE_LIST: {
      const { listId, updates } = action.payload;
      const lists = updateListInArray(state.lists, listId, updates);
      return {
        ...state,
        lists,
        stats: calculateStats(lists)
      };
    }
    
    case LIST_ACTIONS.REMOVE_LIST: {
      const listId = action.payload;
      const lists = state.lists.filter(list => list.id !== listId);
      return {
        ...state,
        lists,
        stats: calculateStats(lists),
        listErrors: {
          ...state.listErrors,
          [listId]: undefined
        }
      };
    }
    
    // Loading states
    case LIST_ACTIONS.SET_LISTS_LOADING: {
      return {
        ...state,
        listsLoading: action.payload
      };
    }
    
    case LIST_ACTIONS.SET_LISTS_ERROR: {
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        listsLoading: false
      };
    }
    
    case LIST_ACTIONS.CLEAR_LISTS_ERROR: {
      return {
        ...state,
        error: null
      };
    }
    
    case LIST_ACTIONS.SET_LIST_LOADING: {
      const { listId, isLoading } = action.payload;
      return {
        ...state,
        isLoading: isLoading
      };
    }
    
    case LIST_ACTIONS.SET_LIST_ERROR: {
      const { listId, error } = action.payload;
      return {
        ...state,
        listErrors: {
          ...state.listErrors,
          [listId]: error
        }
      };
    }
    
    case LIST_ACTIONS.CLEAR_LIST_ERROR: {
      const listId = action.payload;
      return {
        ...state,
        listErrors: {
          ...state.listErrors,
          [listId]: undefined
        }
      };
    }
    
    // Optimistic updates
    case LIST_ACTIONS.OPTIMISTIC_ADD_LIST: {
      const listData = action.payload;
      const tempId = generateTempId();
      const optimisticList = {
        ...listData,
        id: tempId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOptimistic: true
      };
      
      const lists = [...state.lists, optimisticList];
      const adding = [...state.optimisticOperations.adding, {
        tempId,
        listData,
        timestamp: Date.now()
      }];
      
      return {
        ...state,
        lists,
        stats: calculateStats(lists),
        optimisticOperations: {
          ...state.optimisticOperations,
          adding
        }
      };
    }
    
    case LIST_ACTIONS.OPTIMISTIC_UPDATE_LIST: {
      const { listId, updates } = action.payload;
      const originalList = findListById(state.lists, listId);
      
      if (!originalList) return state;
      
      const lists = updateListInArray(state.lists, listId, {
        ...updates,
        isOptimistic: true
      });
      
      const updating = [...state.optimisticOperations.updating, {
        listId,
        originalData: originalList,
        timestamp: Date.now()
      }];
      
      return {
        ...state,
        lists,
        stats: calculateStats(lists),
        optimisticOperations: {
          ...state.optimisticOperations,
          updating
        }
      };
    }
    
    case LIST_ACTIONS.OPTIMISTIC_REMOVE_LIST: {
      const listId = action.payload;
      const originalList = findListById(state.lists, listId);
      
      if (!originalList) return state;
      
      const lists = state.lists.filter(list => list.id !== listId);
      const removing = [...state.optimisticOperations.removing, {
        listId,
        originalData: originalList,
        timestamp: Date.now()
      }];
      
      return {
        ...state,
        lists,
        stats: calculateStats(lists),
        optimisticOperations: {
          ...state.optimisticOperations,
          removing
        }
      };
    }
    
    // Revert optimistic updates
    case LIST_ACTIONS.REVERT_OPTIMISTIC_ADD: {
      const tempId = action.payload;
      const lists = state.lists.filter(list => list.id !== tempId);
      const adding = state.optimisticOperations.adding.filter(
        op => op.tempId !== tempId
      );
      
      return {
        ...state,
        lists,
        stats: calculateStats(lists),
        optimisticOperations: {
          ...state.optimisticOperations,
          adding
        }
      };
    }
    
    case LIST_ACTIONS.REVERT_OPTIMISTIC_UPDATE: {
      const listId = action.payload;
      const updateOp = state.optimisticOperations.updating.find(
        op => op.listId === listId
      );
      
      if (!updateOp) return state;
      
      const lists = state.lists.map(list =>
        list.id === listId ? updateOp.originalData : list
      );
      
      const updating = state.optimisticOperations.updating.filter(
        op => op.listId !== listId
      );
      
      return {
        ...state,
        lists,
        stats: calculateStats(lists),
        optimisticOperations: {
          ...state.optimisticOperations,
          updating
        }
      };
    }
    
    case LIST_ACTIONS.REVERT_OPTIMISTIC_REMOVE: {
      const listId = action.payload;
      const removeOp = state.optimisticOperations.removing.find(
        op => op.listId === listId
      );
      
      if (!removeOp) return state;
      
      const lists = [...state.lists, removeOp.originalData];
      const removing = state.optimisticOperations.removing.filter(
        op => op.listId !== listId
      );
      
      return {
        ...state,
        lists,
        stats: calculateStats(lists),
        optimisticOperations: {
          ...state.optimisticOperations,
          removing
        }
      };
    }
    
    // List items operations
    case LIST_ACTIONS.ADD_ITEM_TO_LIST: {
      const { listId, item } = action.payload;
      const lists = state.lists.map(list => {
        if (list.id === listId) {
          const newItem = {
            id: item.id || generateTempId(),
            text: item.text,
            completed: item.completed || false,
            createdAt: new Date(),
            ...item
          };
          return {
            ...list,
            items: [...(list.items || []), newItem],
            updatedAt: new Date()
          };
        }
        return list;
      });
      
      return {
        ...state,
        lists,
        stats: calculateStats(lists)
      };
    }
    
    case LIST_ACTIONS.UPDATE_ITEM_IN_LIST: {
      const { listId, itemId, updates } = action.payload;
      const lists = state.lists.map(list => {
        if (list.id === listId) {
          const items = (list.items || []).map(item =>
            item.id === itemId
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          );
          return {
            ...list,
            items,
            updatedAt: new Date()
          };
        }
        return list;
      });
      
      return {
        ...state,
        lists,
        stats: calculateStats(lists)
      };
    }
    
    case LIST_ACTIONS.REMOVE_ITEM_FROM_LIST: {
      const { listId, itemId } = action.payload;
      const lists = state.lists.map(list => {
        if (list.id === listId) {
          const items = (list.items || []).filter(item => item.id !== itemId);
          return {
            ...list,
            items,
            updatedAt: new Date()
          };
        }
        return list;
      });
      
      return {
        ...state,
        lists,
        stats: calculateStats(lists)
      };
    }
    
    case LIST_ACTIONS.TOGGLE_ITEM_IN_LIST: {
      const { listId, itemId } = action.payload;
      const lists = state.lists.map(list => {
        if (list.id === listId) {
          const items = (list.items || []).map(item =>
            item.id === itemId
              ? { ...item, completed: !item.completed, updatedAt: new Date() }
              : item
          );
          return {
            ...list,
            items,
            updatedAt: new Date()
          };
        }
        return list;
      });
      
      return {
        ...state,
        lists,
        stats: calculateStats(lists)
      };
    }
    
    // Reset
    case LIST_ACTIONS.RESET_LISTS: {
      return initialListState;
    }
    
    default:
      return state;
  }
}

/**
 * Action creators
 */
export const listActions = {
  // List management
  setLists: (lists) => ({
    type: LIST_ACTIONS.SET_LISTS,
    payload: lists
  }),
  
  addList: (list) => ({
    type: LIST_ACTIONS.ADD_LIST,
    payload: list
  }),
  
  updateList: (listId, updates) => ({
    type: LIST_ACTIONS.UPDATE_LIST,
    payload: { listId, updates }
  }),
  
  removeList: (listId) => ({
    type: LIST_ACTIONS.REMOVE_LIST,
    payload: listId
  }),
  
  // Loading states
  setListsLoading: (isLoading) => ({
    type: LIST_ACTIONS.SET_LISTS_LOADING,
    payload: isLoading
  }),
  
  setListsError: (error) => ({
    type: LIST_ACTIONS.SET_LISTS_ERROR,
    payload: error
  }),
  
  clearListsError: () => ({
    type: LIST_ACTIONS.CLEAR_LISTS_ERROR
  }),
  
  // Optimistic updates
  optimisticAddList: (listData) => ({
    type: LIST_ACTIONS.OPTIMISTIC_ADD_LIST,
    payload: listData
  }),
  
  optimisticUpdateList: (listId, updates) => ({
    type: LIST_ACTIONS.OPTIMISTIC_UPDATE_LIST,
    payload: { listId, updates }
  }),
  
  optimisticRemoveList: (listId) => ({
    type: LIST_ACTIONS.OPTIMISTIC_REMOVE_LIST,
    payload: listId
  }),
  
  // Revert optimistic updates
  revertOptimisticAdd: (tempId) => ({
    type: LIST_ACTIONS.REVERT_OPTIMISTIC_ADD,
    payload: tempId
  }),
  
  revertOptimisticUpdate: (listId) => ({
    type: LIST_ACTIONS.REVERT_OPTIMISTIC_UPDATE,
    payload: listId
  }),
  
  revertOptimisticRemove: (listId) => ({
    type: LIST_ACTIONS.REVERT_OPTIMISTIC_REMOVE,
    payload: listId
  }),
  
  // List items
  addItemToList: (listId, item) => ({
    type: LIST_ACTIONS.ADD_ITEM_TO_LIST,
    payload: { listId, item }
  }),
  
  updateItemInList: (listId, itemId, updates) => ({
    type: LIST_ACTIONS.UPDATE_ITEM_IN_LIST,
    payload: { listId, itemId, updates }
  }),
  
  removeItemFromList: (listId, itemId) => ({
    type: LIST_ACTIONS.REMOVE_ITEM_FROM_LIST,
    payload: { listId, itemId }
  }),
  
  toggleItemInList: (listId, itemId) => ({
    type: LIST_ACTIONS.TOGGLE_ITEM_IN_LIST,
    payload: { listId, itemId }
  }),
  
  // Reset
  resetLists: () => ({
    type: LIST_ACTIONS.RESET_LISTS
  })
};

/**
 * Selectors
 */
export const listSelectors = {
  // Basic selectors
  getLists: (state) => state.lists,
  getListById: (listId) => (state) => findListById(state.lists, listId),
  getListsLoading: (state) => state.listsLoading,
  getListsError: (state) => state.error,
  getListError: (listId) => (state) => state.listErrors[listId],
  
  // Filtered lists
  getOwnedLists: (state) => state.lists.filter(list => list.isCreator),
  getSharedLists: (state) => state.lists.filter(list => !list.isCreator),
  getVisibleLists: (state) => state.lists.filter(list => !list.isOptimistic || list.isOptimistic),
  
  // Statistics
  getStats: (state) => state.stats,
  getTotalLists: (state) => state.stats.total,
  getOwnedListsCount: (state) => state.stats.owned,
  getSharedListsCount: (state) => state.stats.shared,
  getTotalItems: (state) => state.stats.totalItems,
  getCompletedItems: (state) => state.stats.completedItems,
  
  // Optimistic operations
  getOptimisticOperations: (state) => state.optimisticOperations,
  isListOptimistic: (listId) => (state) => {
    const list = findListById(state.lists, listId);
    return list?.isOptimistic || false;
  },
  
  // List items
  getListItems: (listId) => (state) => {
    const list = findListById(state.lists, listId);
    return list?.items || [];
  },
  
  getCompletedItemsInList: (listId) => (state) => {
    const list = findListById(state.lists, listId);
    return (list?.items || []).filter(item => item.completed);
  },
  
  getPendingItemsInList: (listId) => (state) => {
    const list = findListById(state.lists, listId);
    return (list?.items || []).filter(item => !item.completed);
  }
};