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
    
    setUndoActions(prev => [...prev, undoAction]);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      removeUndoAction(id);
    }, 10000);
    
    return id;
  };

  const removeUndoAction = (id) => {
    setUndoActions(prev => prev.filter(action => action.id !== id));
  };

  const executeUndo = async (id) => {
    const action = undoActions.find(a => a.id === id);
    if (action && action.undoFunction) {
      try {
        await action.undoFunction();
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