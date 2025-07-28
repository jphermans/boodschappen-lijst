import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, List, Share2, Trash2, Check, Wifi } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useToast } from './context/ToastContext';
import { useUndo } from './context/UndoContext';
import { getDeviceUID } from './utils/deviceUID';
import { initializeFirebase, isConnected, createShoppingList, getShoppingLists, deleteShoppingList, subscribeToShoppingLists } from './firebase';
import ShoppingList from './components/ShoppingList';
import SettingsModal from './components/SettingsModal';
import QRShareModal from './components/QRShareModal';
import ConnectionError from './components/ConnectionError';
import ToastContainer from './components/Toast';
import UndoBar from './components/UndoBar';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, removeToast, success, error, info } = useToast();
  const { undoActions, addUndoAction, executeUndo, removeUndoAction } = useUndo();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareListId, setShareListId] = useState(null);
  const [deviceUID] = useState(getDeviceUID());
  const [firebaseError, setFirebaseError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeFirebase().then(async ({ error }) => {
      if (error) {
        setFirebaseError(error);
        setIsLoading(false);
      } else {
        try {
          // Load initial shopping lists
          const initialLists = await getShoppingLists(deviceUID);
          setLists(initialLists);
          
          // Subscribe to real-time updates
          const unsubscribe = subscribeToShoppingLists(deviceUID, (firebaseLists) => {
            setLists(firebaseLists);
          });
          
          return () => unsubscribe();
        } catch (error) {
          console.error('Error loading shopping lists:', error);
          setFirebaseError(error);
        } finally {
          setIsLoading(false);
        }
      }
    });
  }, [deviceUID]);

  const retryConnection = () => {
    setIsLoading(true);
    setFirebaseError(null);
    initializeFirebase().then(({ error }) => {
      if (error) {
        setFirebaseError(error);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    console.log('Device UID:', deviceUID);
  }, [deviceUID]);

  const createList = async () => {
    if (newListName.trim()) {
      try {
        const newList = {
          name: newListName.trim(),
          items: [],
          deviceUID: deviceUID
        };
        await createShoppingList(newList);
        setNewListName('');
        success(`Lijst "${newListName.trim()}" is aangemaakt! 🎉`);
      } catch (error) {
        console.error('Error creating shopping list:', error);
        error('Er ging iets mis bij het aanmaken van de lijst');
      }
    }
  };

  const deleteList = async (listId) => {
    try {
      const listToDelete = lists.find(l => l.id === listId);
      await deleteShoppingList(listId);
      
      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
      
      // Add undo action
      addUndoAction({
        message: `Lijst "${listToDelete?.name}" verwijderd`,
        undoFunction: async () => {
          await createShoppingList(listToDelete);
          success(`Lijst "${listToDelete?.name}" hersteld! 🎉`);
        }
      });
      
      success(`Lijst "${listToDelete?.name}" is verwijderd`);
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      error('Er ging iets mis bij het verwijderen van de lijst');
    }
  };

  const handleShare = (listId) => {
    setShareListId(listId);
    setShowShare(true);
    info('Deel de QR-code of link om je lijst te delen! 📤');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-color))]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-[rgb(var(--text-color))]/80">
            Verbinden met database...
          </p>
        </div>
      </div>
    );
  }

  if (firebaseError) {
    return <ConnectionError error={firebaseError} onRetry={retryConnection} />;
  }

  const isOffline = !isConnected;

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-color))] transition-colors duration-300">
      <header className="bg-[rgb(var(--card-bg))] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <List className="w-8 h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--card-text))]">
              Boodschappenlijst
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              aria-label="Thema wisselen"
            >
              <span className="text-lg">
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              aria-label="Instellingen"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {!selectedList ? (
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[rgb(var(--card-bg))] rounded-lg shadow-lg p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-[rgb(var(--card-text))] mb-4">
                Nieuwe lijst maken
              </h2>
              <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createList()}
                  placeholder="Naam van je boodschappenlijst..."
                  className="flex-1 px-4 py-3 border border-[rgb(var(--border-color))] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] text-lg"
                />
                <button
                  onClick={createList}
                  disabled={!newListName.trim()}
                  className="w-full lg:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  <span className="font-medium">Aanmaken</span>
                </button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lists.map((list) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[rgb(var(--card-bg))] rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-2">
                    {list.name}
                  </h3>
                  <p className="text-[rgb(var(--text-color))]/60 mb-4">
                    {list.items.length} item{list.items.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => setSelectedList(list)}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      <span className="font-medium">Openen</span>
                    </button>
                    <button
                      onClick={() => handleShare(list.id)}
                      className="flex items-center justify-center px-3 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      title="Delen"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteList(list.id)}
                      className="flex items-center justify-center px-3 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      title="Verwijderen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {lists.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <List className="w-16 h-16 text-[rgb(var(--text-color))]/40 mx-auto mb-4" />
                <p className="text-[rgb(var(--text-color))]/60">
                  Je hebt nog geen boodschappenlijsten. Maak er een aan om te beginnen!
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          <ShoppingList
            list={selectedList}
            onBack={() => setSelectedList(null)}
            onUpdateList={(updatedList) => {
              setLists(lists.map(l => l.id === updatedList.id ? updatedList : l));
              setSelectedList(updatedList);
            }}
            onShare={handleShare}
          />
        )}
      </main>

      {isOffline && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <Wifi className="w-4 h-4" />
          <span className="text-sm">Offline mode</span>
        </div>
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showShare && (
        <QRShareModal
          listId={shareListId}
          onClose={() => {
            setShowShare(false);
            setShareListId(null);
          }}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <UndoBar 
        undoActions={undoActions} 
        executeUndo={executeUndo} 
        removeUndoAction={removeUndoAction} 
      />
    </div>
  );
}

export default App;