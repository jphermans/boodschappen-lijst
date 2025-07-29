import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, List, Share2, Trash2, Check, Wifi, QrCode } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useToast } from './context/ToastContext';
import { useUndo } from './context/UndoContext';
import { initializeFirebase, isConnected, getCurrentUserID, createShoppingList, getShoppingLists, deleteShoppingList, subscribeToShoppingLists } from './firebase';
import ShoppingList from './components/ShoppingList';
import SettingsModal from './components/SettingsModal';
import QRShareModal from './components/QRShareModal';
import QRScannerModal from './components/QRScannerModal';
import ConnectionError from './components/ConnectionError';
import ToastContainer from './components/Toast';
import UndoBar from './components/UndoBar';
import VoiceInput from './components/VoiceInput';
import { validateListName } from './utils/validation';
import { validateQRData } from './utils/qrSecurity';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, removeToast, removeToastByMessage, success, error, info, deleteToast } = useToast();
  const { undoActions, addUndoAction, executeUndo, removeUndoAction } = useUndo();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [shareListId, setShareListId] = useState(null);
  const [firebaseError, setFirebaseError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { error } = await initializeFirebase();
        if (error) {
          setFirebaseError(error);
          setIsLoading(false);
          return;
        }

        // Wait a moment for authentication to complete
        setTimeout(async () => {
          try {
            const userID = getCurrentUserID();
            if (userID) {
              // Load initial shopping lists
              const initialLists = await getShoppingLists();
              setLists(initialLists);
              
              // Subscribe to real-time updates
              const unsubscribe = subscribeToShoppingLists((firebaseLists) => {
                setLists(firebaseLists);
              });
              
              return () => unsubscribe();
            }
          } catch (error) {
            console.error('Error loading shopping lists:', error);
            setFirebaseError(error);
          } finally {
            setIsLoading(false);
          }
        }, 1000); // Wait for auth to complete
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setFirebaseError(error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

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

  const createList = async () => {
    const validation = validateListName(newListName);
    if (!validation.valid) {
      error(validation.error);
      return;
    }

    try {
      const userID = getCurrentUserID();
      if (!userID) {
        error('Gebruiker niet ingelogd. Probeer de pagina te vernieuwen.');
        return;
      }
      
      const newList = {
        name: validation.value,
        items: [],
        userId: userID
      };
      await createShoppingList(newList);
      setNewListName('');
      success(`Lijst "${validation.value}" is aangemaakt! 🎉`);
    } catch (error) {
      console.error('Error creating shopping list:', error);
      error('Er ging iets mis bij het aanmaken van de lijst');
    }
  };

  const deleteList = async (listId) => {
    try {
      const listToDelete = lists.find(l => l.id === listId);
      
      if (!listToDelete) {
        error('Lijst niet gevonden');
        return;
      }
      
      await deleteShoppingList(listId);
      
      // Manually update the lists state to ensure immediate UI update
      setLists(prevLists => prevLists.filter(l => l.id !== listId));
      
      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
      
      const deleteMessage = `Lijst "${listToDelete?.name}" is verwijderd`;
      
      // Add undo action
      addUndoAction({
        message: `Lijst "${listToDelete?.name}" verwijderd`,
        undoFunction: async () => {
          try {
            // Hide the deletion toast when undoing
            removeToastByMessage(deleteMessage);
            
            // Remove the id field to allow Firebase to create a new one
            const { id, createdAt, updatedAt, ...listDataToRestore } = listToDelete;
            
            await createShoppingList(listDataToRestore);
            success(`Lijst "${listToDelete?.name}" hersteld! 🎉`, 2000);
          } catch (err) {
            console.error('Error restoring list:', err);
            error('Er ging iets mis bij het herstellen van de lijst');
          }
        }
      });
      
      success(deleteMessage, 8000);
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      error('Er ging iets mis bij het verwijderen van de lijst', 3000);
    }
  };

  const handleShare = (listId) => {
    setShareListId(listId);
    setShowShare(true);
    info('Deel de QR-code of link om je lijst te delen! 📤');
  };

  const handleScanSuccess = async (scannedData) => {
    try {
      const validation = validateQRData(scannedData);
      
      if (!validation.valid) {
        error(validation.error);
        return;
      }

      const { listId } = validation;
      
      // For now, just show success message
      // In a real implementation, you'd fetch the shared list from Firebase
      success(`Gedeelde lijst gevonden: ${listId}`, 3000);
      info('Functionaliteit om gedeelde lijsten te importeren komt binnenkort! 🚧', 4000);
      
    } catch (err) {
      error('Fout bij verwerken van gescande code');
    }
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              aria-label="QR-code scannen"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              aria-label="Thema wisselen"
            >
              <span className="text-lg">
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-[rgb(var(--border-color))]/60 hover:bg-[rgb(var(--border-color))]/80 text-[rgb(var(--card-text))] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createList()}
                    placeholder="Naam van je boodschappenlijst..."
                    className="w-full px-4 py-3 border border-[rgb(var(--border-color))] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] text-lg"
                  />
                </div>
                <div className="flex space-x-2">
                  <VoiceInput 
                    onTranscript={(text) => setNewListName(text)}
                    placeholder="Spreek lijstnaam uit..."
                    className="flex-shrink-0"
                  />
                  <button
                    onClick={createList}
                    disabled={!newListName.trim()}
                    className="flex items-center justify-center px-6 py-3 bg-primary hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span className="font-medium">Aanmaken</span>
                  </button>
                </div>
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
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setSelectedList(list)}
                      className="w-full flex items-center justify-center px-4 py-3 bg-primary hover:opacity-90 text-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      <span className="font-medium">Openen</span>
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShare(list.id)}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-secondary hover:opacity-90 text-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        title="Delen"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        <span className="font-medium">Delen</span>
                      </button>
                      <button
                        onClick={() => deleteList(list.id)}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-accent hover:opacity-90 text-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="font-medium">Verwijderen</span>
                      </button>
                    </div>
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
                <p className="text-[rgb(var(--text-color))]/60 mb-6">
                  Je hebt nog geen boodschappenlijsten. Maak er een aan om te beginnen!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    <span className="font-medium">Scan gedeelde lijst</span>
                  </button>
                  <span className="text-[rgb(var(--text-color))]/40 text-sm">of</span>
                  <span className="text-[rgb(var(--text-color))]/60 text-sm">Maak hierboven een nieuwe lijst aan</span>
                </div>
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
        <div className="fixed bottom-20 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <Wifi className="w-4 h-4" />
          <span className="text-sm">Offline mode</span>
        </div>
      )}

      {/* Floating QR Scanner Button for Mobile */}
      {!selectedList && lists.length > 0 && (
        <div className="fixed bottom-6 right-6 lg:hidden">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-200"
            aria-label="QR-code scannen"
          >
            <QrCode className="w-6 h-6" />
          </button>
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

      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          onScanSuccess={handleScanSuccess}
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