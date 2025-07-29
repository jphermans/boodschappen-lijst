import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, List, Share2, Trash2, Check, Wifi, QrCode } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useToast } from './context/ToastContext';
import { useUndo } from './context/UndoContext';
import { initializeFirebase, isConnected, getCurrentUserID, createShoppingList, getShoppingLists, deleteShoppingList, subscribeToShoppingLists, canDeleteList, shareListWithUser, getListById } from './firebase';
import ShoppingList from './components/ShoppingList';
import SettingsModal from './components/SettingsModal';
import QRShareModal from './components/QRShareModal';
import QRScannerModal from './components/QRScannerModal';
import ConnectionError from './components/ConnectionError';
import ToastContainer from './components/Toast';
import UndoBar from './components/UndoBar';
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
  const [isProcessingQRScan, setIsProcessingQRScan] = useState(false);

  // Handle shared list URLs
  const handleSharedListFromURL = async (currentLists = lists) => {
    const hash = window.location.hash;
    console.log('🌐 URL Hash Handler - Current hash:', hash);
    console.log('🌐 URL Hash Handler - isProcessingQRScan flag:', isProcessingQRScan);
    
    // Double-check the QR scan flag
    if (isProcessingQRScan) {
      console.log('🌐 URL Hash Handler - BLOCKED: QR scan in progress, ignoring hash change');
      return;
    }
    
    const sharedMatch = hash.match(/^#\/shared\/(.+)$/);
    
    if (sharedMatch) {
      const listId = sharedMatch[1];
      console.log('🌐 URL Hash Handler - Found shared list ID in URL:', listId);
      console.log('🌐 URL Hash Handler - Current lists count:', currentLists.length);
      console.log('🌐 URL Hash Handler - Current user ID:', getCurrentUserID());
      console.log('🌐 URL Hash Handler - This was triggered by URL navigation, NOT QR scanning');
      
      try {
        console.log('🌐 Step 1: Fetching list from Firebase...');
        // Get the shared list
        const sharedList = await getListById(listId);
        console.log('🌐 Step 1 Result: Retrieved list:', sharedList);
        
        if (!sharedList) {
          console.error('❌ URL Hash Handler - List not found for ID:', listId);
          error('Gedeelde lijst niet gevonden of niet toegankelijk');
          // Clear the hash
          window.location.hash = '';
          return;
        }
        
        console.log('🌐 Step 2: Checking user access...');
        // Check if user already has access to this list
        const currentUserId = getCurrentUserID();
        const alreadyHasAccess = currentLists.some(list => list.id === listId);
        console.log('🌐 Step 2 Result: Already has access:', alreadyHasAccess);
        
        if (alreadyHasAccess) {
          console.log('ℹ️ URL Hash Handler - User already has access to this list');
          info(`Je hebt al toegang tot lijst "${sharedList.name}"`);
          // Clear the hash
          window.location.hash = '';
          return;
        }
        
        console.log('🌐 Step 3: Sharing list with user...');
        // Share the list with the current user
        await shareListWithUser(listId, currentUserId);
        console.log('✅ URL Hash Handler - List shared successfully!');
        
        success(`Lijst "${sharedList.name}" is gedeeld met jou! 🎉`);
        info('De lijst verschijnt nu in je overzicht', 3000);
        
        // Clear the hash
        window.location.hash = '';
        
      } catch (err) {
        console.error('❌ URL Hash Handler - Error processing shared list from URL:', err);
        console.error('❌ URL Hash Handler - Error details:', {
          message: err.message,
          code: err.code,
          stack: err.stack,
          listId: listId,
          hash: hash,
          isQRScan: isProcessingQRScan
        });
        
        console.log('❌ URL Hash Handler - This error came from URL navigation, not QR scanning');
        
        // Provide more specific error messages based on error type
        if (err.code === 'permission-denied') {
          error('Geen toegang tot deze lijst. Controleer of de lijst nog bestaat.');
        } else if (err.code === 'not-found') {
          error('Lijst niet gevonden. De link is mogelijk verlopen.');
        } else if (err.message?.includes('network')) {
          error('Netwerkfout. Controleer je internetverbinding.');
        } else {
          error(`Fout bij verwerken van gedeelde lijst: ${err.message || 'Onbekende fout'}`);
        }
        
        // Clear the hash
        window.location.hash = '';
      }
    } else {
      console.log('🌐 URL Hash Handler - No shared list pattern found in hash:', hash);
    }
  };

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
              
              // Check for shared list in URL hash after lists are loaded
              setTimeout(() => {
                handleSharedListFromURL(initialLists);
              }, 500);
              
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

  // Listen for hash changes (when someone navigates to a shared link)
  useEffect(() => {
    const handleHashChange = () => {
      if (!isLoading && !firebaseError && !isProcessingQRScan) {
        console.log('🌐 Hash change detected, processing URL...');
        handleSharedListFromURL(lists);
      } else if (isProcessingQRScan) {
        console.log('🌐 Hash change ignored - QR scan in progress');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isLoading, firebaseError, lists, isProcessingQRScan]);


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
        items: []
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
      
      // Check if user can delete this list (only creator can delete)
      if (!canDeleteList(listToDelete)) {
        error('Alleen de maker van de lijst kan deze verwijderen');
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
            const { id, createdAt, updatedAt, isCreator, ...listDataToRestore } = listToDelete;
            
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
    console.log('🔍 QR Scan Debug - Starting scan process');
    console.log('📱 Scanned data:', scannedData);
    console.log('📱 Data type:', typeof scannedData);
    console.log('📱 Data length:', scannedData?.length);
    
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
        return;
      }

      const { listId } = validation;
      console.log('🔍 Step 2: Extracted list ID:', listId);
      
      // Step 2: Check if the list exists and get its details
      console.log('🔍 Step 3: Fetching list from Firebase...');
      const sharedList = await getListById(listId);
      console.log('📋 Retrieved list:', sharedList);
      
      if (!sharedList) {
        console.error('❌ List not found in Firebase for ID:', listId);
        error('Gedeelde lijst niet gevonden of niet toegankelijk');
        return;
      }
      
      // Step 3: Check if user already has access to this list
      console.log('🔍 Step 4: Checking user access...');
      const currentUserId = getCurrentUserID();
      console.log('👤 Current user ID:', currentUserId);
      console.log('📋 Current lists count:', lists.length);
      console.log('📋 Current list IDs:', lists.map(l => l.id));
      
      const alreadyHasAccess = lists.some(list => list.id === listId);
      console.log('🔐 Already has access:', alreadyHasAccess);
      
      if (alreadyHasAccess) {
        console.log('ℹ️ User already has access to this list');
        info(`Je hebt al toegang tot lijst "${sharedList.name}"`);
        return;
      }
      
      // Step 4: Share the list with the current user
      console.log('🔍 Step 5: Sharing list with user...');
      console.log('🔗 Sharing list ID:', listId, 'with user:', currentUserId);
      
      await shareListWithUser(listId, currentUserId);
      console.log('✅ List shared successfully!');
      
      success(`Lijst "${sharedList.name}" is gedeeld met jou! 🎉`);
      info('De lijst verschijnt nu in je overzicht', 3000);
      
    } catch (err) {
      console.error('❌ Error processing scanned QR code:', err);
      console.error('❌ Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      
      // Provide more specific error messages based on error type
      if (err.code === 'permission-denied') {
        error('Geen toegang tot deze lijst. Controleer of de lijst nog bestaat.');
      } else if (err.code === 'not-found') {
        error('Lijst niet gevonden. De QR-code is mogelijk verlopen.');
      } else if (err.message?.includes('network')) {
        error('Netwerkfout. Controleer je internetverbinding.');
      } else {
        error(`Fout bij verwerken van gescande code: ${err.message || 'Onbekende fout'}`);
      }
    } finally {
      // Always clear the flag when done
      setIsProcessingQRScan(false);
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <List className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))]">
              Boodschappenlijst
            </h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              aria-label="QR-code scannen"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              aria-label="Thema wisselen"
            >
              <span className="text-base sm:text-lg">
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[rgb(var(--border-color))]/60 hover:bg-[rgb(var(--border-color))]/80 text-[rgb(var(--card-text))] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              aria-label="Instellingen"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8">
        {!selectedList ? (
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[rgb(var(--card-bg))] rounded-lg shadow-lg p-6 mb-6"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-[rgb(var(--card-text))] mb-3 sm:mb-4">
                Nieuwe lijst maken
              </h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createList()}
                    placeholder="Naam van je boodschappenlijst..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[rgb(var(--border-color))] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] text-base sm:text-lg"
                  />
                </div>
                <button
                  onClick={createList}
                  disabled={!newListName.trim()}
                  className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-primary hover:opacity-90 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="font-medium text-sm sm:text-base">Aanmaken</span>
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
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-[rgb(var(--card-text))] flex-1 pr-2">
                      {list.name}
                    </h3>
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      list.isCreator
                        ? 'bg-primary/20 text-primary'
                        : 'bg-secondary/20 text-secondary'
                    }`}>
                      {list.isCreator ? 'Eigenaar' : 'Gedeeld'}
                    </span>
                  </div>
                  <p className="text-[rgb(var(--text-color))]/60 mb-3 sm:mb-4 text-sm">
                    {list.items.length} item{list.items.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setSelectedList(list)}
                      className="w-full flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-primary hover:opacity-90 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="font-medium text-sm sm:text-base">Openen</span>
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShare(list.id)}
                        className="flex-1 flex items-center justify-center px-2 sm:px-4 py-2 sm:py-3 bg-secondary hover:opacity-90 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        title="Delen"
                      >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Delen</span>
                      </button>
                      {canDeleteList(list) && (
                        <button
                          onClick={() => deleteList(list.id)}
                          className="flex-1 flex items-center justify-center px-2 sm:px-4 py-2 sm:py-3 bg-accent hover:opacity-90 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          title="Verwijderen"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="font-medium text-xs sm:text-sm">Verwijderen</span>
                        </button>
                      )}
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
                <List className="w-12 h-12 sm:w-16 sm:h-16 text-[rgb(var(--text-color))]/40 mx-auto mb-3 sm:mb-4" />
                <p className="text-[rgb(var(--text-color))]/60 mb-4 sm:mb-6 text-sm sm:text-base px-4 text-center">
                  Je hebt nog geen boodschappenlijsten. Maak er een aan om te beginnen!
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center px-4">
                  <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <QrCode className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="font-medium text-sm sm:text-base">Scan gedeelde lijst</span>
                  </button>
                  <span className="text-[rgb(var(--text-color))]/40 text-xs sm:text-sm">of</span>
                  <span className="text-[rgb(var(--text-color))]/60 text-xs sm:text-sm text-center">Maak hierboven een nieuwe lijst aan</span>
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
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:hidden">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-200"
            aria-label="QR-code scannen"
          >
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
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