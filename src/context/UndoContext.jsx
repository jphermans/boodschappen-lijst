import React, { createContext, useContext, useState } from 'react';

const UndoContext = createContext();

export const useUndo = () => {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error('useUndo must be used within an UndoProvider');
  }
  return context;
};

export const UndoProvider = ({ children }) => {
  const [undoActions, setUndoActions] = useState([]);

  const addUndoAction = (action) => {
    const id = crypto.randomUUID();
    const undoAction = { id, ...action, timestamp: Date.now() };
    
    console.log('Adding undo action:', action.message);
    
    // Clear existing timeouts and set new action
    setUndoActions(prev => {
      // Clear any existing timeouts
      prev.forEach(existingAction => {
        if (existingAction.timeoutId) {
          clearTimeout(existingAction.timeoutId);
        }
      });
      
      // Only keep the latest action
      return [undoAction];
    });
    
    // Auto-remove after 3 seconds
    const timeoutId = setTimeout(() => {
      console.log('Removing undo action after 3s:', action.message);
      removeUndoAction(id);
    }, 3000);
    
    undoAction.timeoutId = timeoutId;
    
    return id;
  };

  const removeUndoAction = (id) => {
    setUndoActions(prev => {
      const action = prev.find(a => a.id === id);
      if (action && action.timeoutId) {
        clearTimeout(action.timeoutId);
      }
      return prev.filter(action => action.id !== id);
    });
  };

  const executeUndo = async (id) => {
    const action = undoActions.find(a => a.id === id);
    if (action && action.action) {
      try {
        await action.action();
        removeUndoAction(id);
        return true;
      } catch (error) {
        console.error('Error executing undo:', error);
        return false;
      }
    }
    return false;
  };

  const clearUndoActions = () => {
    setUndoActions([]);
  };

  const value = {
    undoActions,
    addUndoAction,
    removeUndoAction,
    executeUndo,
    clearUndoActions,
  };

  return (
    <UndoContext.Provider value={value}>
      {children}
    </UndoContext.Provider>
  );
}; 