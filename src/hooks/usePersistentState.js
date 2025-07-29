// React hook for persistent state management with iOS Safari compatibility
import { useState, useEffect, useCallback, useRef } from 'react';
import { stateManager, useAppState } from '../utils/stateManager';
import { enhancedUserManager } from '../utils/enhancedUserManager';

// Custom hook for persistent state management
export function usePersistentState(key, defaultValue, options = {}) {
  const [state, setState] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const { immediate = false, critical = false } = options;

  // Load initial state
  useEffect(() => {
    let isCancelled = false;

    const loadInitialState = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storedValue = stateManager.getState(key);
        
        if (!isCancelled && mountedRef.current) {
          if (storedValue !== undefined) {
            setState(storedValue);
          } else {
            setState(defaultValue);
            if (defaultValue !== undefined) {
              await stateManager.setState(key, defaultValue, { immediate: critical });
            }
          }
        }
      } catch (err) {
        console.error(`Failed to load persistent state for key ${key}:`, err);
        if (!isCancelled && mountedRef.current) {
          setError(err);
          setState(defaultValue);
        }
      } finally {
        if (!isCancelled && mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadInitialState();

    return () => {
      isCancelled = true;
    };
  }, [key, defaultValue, critical]);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = stateManager.subscribe(key, ({ newValue }) => {
      if (mountedRef.current && newValue !== undefined) {
        setState(newValue);
      }
    });

    // Also subscribe to global state reloads
    const unsubscribeGlobal = stateManager.subscribe('state_reloaded', () => {
      if (mountedRef.current) {
        const currentValue = stateManager.getState(key);
        if (currentValue !== undefined) {
          setState(currentValue);
        }
      }
    });

    return () => {
      unsubscribe();
      unsubscribeGlobal();
    };
  }, [key]);

  // Update state function
  const updateState = useCallback(async (newValue) => {
    try {
      setError(null);
      
      const valueToSet = typeof newValue === 'function' ? newValue(state) : newValue;
      
      setState(valueToSet);
      await stateManager.setState(key, valueToSet, { immediate: immediate || critical });
      
      return valueToSet;
    } catch (err) {
      console.error(`Failed to update persistent state for key ${key}:`, err);
      setError(err);
      throw err;
    }
  }, [key, state, immediate, critical]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return [state, updateState, { isLoading, error }];
}

// Hook for user state management
export function useUserState() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user info
  useEffect(() => {
    let isCancelled = false;

    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const info = await enhancedUserManager.getUserInfo();
        
        if (!isCancelled) {
          setUserInfo(info);
        }
      } catch (err) {
        console.error('Failed to load user info:', err);
        if (!isCancelled) {
          setError(err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadUserInfo();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Subscribe to user state changes
  useEffect(() => {
    const unsubscribe = stateManager.subscribe('user', async () => {
      try {
        const info = await enhancedUserManager.getUserInfo();
        setUserInfo(info);
      } catch (err) {
        console.error('Failed to update user info:', err);
        setError(err);
      }
    });

    return unsubscribe;
  }, []);

  const setUserName = useCallback(async (name) => {
    try {
      setError(null);
      await enhancedUserManager.setUserName(name);
      
      // Update local state
      const updatedInfo = await enhancedUserManager.getUserInfo();
      setUserInfo(updatedInfo);
      
      return true;
    } catch (err) {
      console.error('Failed to set user name:', err);
      setError(err);
      throw err;
    }
  }, []);

  const clearUserName = useCallback(async () => {
    try {
      setError(null);
      await enhancedUserManager.clearUserName();
      
      // Update local state
      const updatedInfo = await enhancedUserManager.getUserInfo();
      setUserInfo(updatedInfo);
      
      return true;
    } catch (err) {
      console.error('Failed to clear user name:', err);
      setError(err);
      throw err;
    }
  }, []);

  return {
    userInfo,
    setUserName,
    clearUserName,
    isLoading,
    error
  };
}

// Hook for shopping lists management
export function useShoppingLists() {
  const [lists, setLists] = usePersistentState('lists', [], { critical: true });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addList = useCallback(async (listData) => {
    try {
      setIsLoading(true);
      setError(null);

      const newList = await stateManager.addList(listData);
      
      // Update local state
      setLists(current => [...current, newList]);
      
      return newList;
    } catch (err) {
      console.error('Failed to add list:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setLists]);

  const updateList = useCallback(async (listId, updates) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedList = await stateManager.updateList(listId, updates);
      
      // Update local state
      setLists(current => 
        current.map(list => list.id === listId ? updatedList : list)
      );
      
      return updatedList;
    } catch (err) {
      console.error('Failed to update list:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setLists]);

  const removeList = useCallback(async (listId) => {
    try {
      setIsLoading(true);
      setError(null);

      await stateManager.removeList(listId);
      
      // Update local state
      setLists(current => current.filter(list => list.id !== listId));
      
      return true;
    } catch (err) {
      console.error('Failed to remove list:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setLists]);

  const getList = useCallback((listId) => {
    return lists.find(list => list.id === listId);
  }, [lists]);

  return {
    lists,
    addList,
    updateList,
    removeList,
    getList,
    isLoading,
    error
  };
}

// Hook for theme management
export function useTheme() {
  const [theme, setThemeState] = usePersistentState('theme', { theme: 'light' });
  const [isLoading, setIsLoading] = useState(false);

  const currentTheme = theme?.theme || 'light';

  const setTheme = useCallback(async (newTheme) => {
    try {
      setIsLoading(true);
      
      await stateManager.setTheme(newTheme);
      setThemeState({ theme: newTheme, updatedAt: Date.now() });
      
      return newTheme;
    } catch (err) {
      console.error('Failed to set theme:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setThemeState]);

  const toggleTheme = useCallback(async () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    return await setTheme(newTheme);
  }, [currentTheme, setTheme]);

  // Apply theme to document on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return {
    theme: currentTheme,
    setTheme,
    toggleTheme,
    isLoading
  };
}

// Hook for UI state management
export function useUIState(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial UI state
  useEffect(() => {
    const currentValue = stateManager.getUIState(key);
    setValue(currentValue !== undefined ? currentValue : defaultValue);
    setIsLoading(false);
  }, [key, defaultValue]);

  // Subscribe to UI state changes
  useEffect(() => {
    const unsubscribe = stateManager.subscribe('ui', ({ newValue }) => {
      if (newValue && newValue[key] !== undefined) {
        setValue(newValue[key]);
      }
    });

    return unsubscribe;
  }, [key]);

  const updateValue = useCallback(async (newValue) => {
    try {
      const valueToSet = typeof newValue === 'function' ? newValue(value) : newValue;
      
      setValue(valueToSet);
      await stateManager.setUIState(key, valueToSet);
      
      return valueToSet;
    } catch (err) {
      console.error(`Failed to update UI state for key ${key}:`, err);
      throw err;
    }
  }, [key, value]);

  return [value, updateValue, { isLoading }];
}

// Hook for state backup and recovery
export function useStateBackup() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState(null);

  const createBackup = useCallback(async () => {
    try {
      setIsCreatingBackup(true);
      setError(null);

      const backup = await stateManager.createBackup();
      
      // Create downloadable backup file
      const backupData = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `boodschappenlijst-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      return backup;
    } catch (err) {
      console.error('Failed to create backup:', err);
      setError(err);
      throw err;
    } finally {
      setIsCreatingBackup(false);
    }
  }, []);

  const restoreFromBackup = useCallback(async (backupData) => {
    try {
      setIsRestoring(true);
      setError(null);

      const success = await stateManager.restoreFromBackup(backupData);
      
      if (success) {
        // Reload the page to apply restored state
        window.location.reload();
      }
      
      return success;
    } catch (err) {
      console.error('Failed to restore from backup:', err);
      setError(err);
      throw err;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const restoreFromFile = useCallback(async (file) => {
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      return await restoreFromBackup(backupData);
    } catch (err) {
      console.error('Failed to restore from file:', err);
      setError(err);
      throw err;
    }
  }, [restoreFromBackup]);

  return {
    createBackup,
    restoreFromBackup,
    restoreFromFile,
    isCreatingBackup,
    isRestoring,
    error
  };
}

// Hook for monitoring state health
export function useStateHealth() {
  const [healthInfo, setHealthInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadHealthInfo = async () => {
      try {
        const info = await stateManager.getStateInfo();
        
        if (!isCancelled) {
          setHealthInfo(info);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load state health info:', err);
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadHealthInfo();

    // Update health info periodically
    const interval = setInterval(loadHealthInfo, 30000); // Every 30 seconds

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  const refreshHealthInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await stateManager.getStateInfo();
      setHealthInfo(info);
    } catch (err) {
      console.error('Failed to refresh state health info:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    healthInfo,
    refreshHealthInfo,
    isLoading
  };
}