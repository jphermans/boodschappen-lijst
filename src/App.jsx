import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, List, Share2, Trash2, Check, Wifi, QrCode, Users } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useToast } from './context/ToastContext';
import { useUndo } from './context/UndoContext';
import { initializeFirebase, isConnected, getCurrentUserID, createShoppingList, getShoppingLists, deleteShoppingList, subscribeToShoppingLists, canDeleteList, shareListWithUser, getListById } from './firebase';
import ShoppingList from './components/ShoppingList';
import SettingsModal from './components/SettingsModal';
import QRShareModal from './components/QRShareModal';
import QRScannerModal from './components/QRScannerModal';
import UserManagementModal from './components/UserManagementModal';
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
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [shareListId, setShareListId] = useState(null);
  const [managementListId, setManagementListId] = useState(null);
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
      
      success(deleteMessage, 3000);
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

  const handleUserManagement = (listId) => {
    setManagementListId(listId);
    setShowUserManagement(true);
    info('Beheer gebruikers die toegang hebben tot je lijst 👥');
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
      
      // Handle permission denied case (expected for QR scanning)
      if (sharedList && sharedList.permissionDenied) {
        console.log('🔍 Step 3a: Permission denied - attempting to share list anyway...');
        
        // Check if user already has access to this list
        const currentUserId = getCurrentUserID();
        console.log('👤 Current user ID:', currentUserId);
        console.log('📋 Current lists count:', lists.length);
        console.log('📋 Current list IDs:', lists.map(l => l.id));
        
        const alreadyHasAccess = lists.some(list => list.id === listId);
        console.log('🔐 Already has access:', alreadyHasAccess);
        
        if (alreadyHasAccess) {
          console.log('ℹ️ User already has access to this list');
          info('Je hebt al toegang tot deze lijst');
          return;
        }
        
        // Try to share the list directly (this might work if the list exists)
        console.log('🔍 Step 4: Attempting to share list with permission denied...');
        try {
          await shareListWithUser(listId, currentUserId);
          console.log('✅ List shared successfully despite initial permission denial!');
          success('Lijst succesvol gedeeld! 🎉');
          info('De lijst verschijnt nu in je overzicht', 3000);
          return;
        } catch (shareError) {
          console.error('❌ Failed to share list:', shareError);
          if (shareError.code === 'not-found') {
            error('Lijst niet gevonden. De QR-code is mogelijk verlopen.');
          } else {
            error('Geen toegang tot deze lijst. Controleer of de lijst nog bestaat.');
          }
          return;
        }
      }
      
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
      {/* Desktop Navigation Bar */}
      <header className="bg-[rgb(var(--card-bg))] shadow-sm border-b border-[rgb(var(--border-color))]/20">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
                <List className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--card-text))] tracking-tight">
                  Boodschappenlijst
                </h1>
                <p className="hidden lg:block text-sm text-[rgb(var(--text-color))]/60 font-medium">
                  Beheer en deel je lijsten
                </p>
              </div>
            </div>

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4">
              <button
                onClick={() => setSelectedList(null)}
                className={`px-4 xl:px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  !selectedList
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/20 hover:text-[rgb(var(--card-text))]'
                }`}
              >
                <List className="w-4 h-4 inline mr-2" />
                Overzicht
              </button>
              <button
                onClick={() => setShowScanner(true)}
                className="px-4 xl:px-6 py-2.5 rounded-xl font-medium text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/20 hover:text-[rgb(var(--card-text))] transition-all duration-200"
              >
                <QrCode className="w-4 h-4 inline mr-2" />
                QR Scanner
              </button>
              <div className="w-px h-8 bg-[rgb(var(--border-color))]/30"></div>
              <div className="flex items-center space-x-1 xl:space-x-2">
                <span className="text-sm text-[rgb(var(--text-color))]/60 font-medium">
                  {lists.length} lijst{lists.length !== 1 ? 'en' : ''}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* Mobile QR Scanner */}
              <button
                onClick={() => setShowScanner(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                aria-label="QR-code scannen"
              >
                <QrCode className="w-5 h-5" />
              </button>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group"
                aria-label="Thema wisselen"
              >
                <span className="text-lg lg:text-xl group-hover:scale-110 transition-transform duration-200">
                  {theme === 'light' ? '🌙' : '☀️'}
                </span>
              </button>
              
              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[rgb(var(--border-color))]/60 hover:bg-[rgb(var(--border-color))]/80 text-[rgb(var(--card-text))] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group"
                aria-label="Instellingen"
              >
                <Settings className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1920px] mx-auto px-4 lg:px-8 xl:px-12 py-6 lg:py-8 xl:py-12">
        {!selectedList ? (
          <div className="lg:flex lg:space-x-8 xl:space-x-12">
            {/* Main Content Area */}
            <div className="flex-1">
              {/* Create New List Section - Desktop Optimized */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8 xl:p-10 mb-8"
              >
                <div className="flex items-center justify-between mb-6 lg:mb-8">
                  <div>
                    <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--card-text))] mb-2">
                      Nieuwe lijst maken
                    </h2>
                    <p className="text-[rgb(var(--text-color))]/60 text-sm lg:text-base">
                      Maak een nieuwe boodschappenlijst en deel deze met anderen
                    </p>
                  </div>
                  <div className="hidden lg:flex items-center space-x-4 text-sm text-[rgb(var(--text-color))]/60">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{lists.filter(l => l.isCreator).length} eigenaar</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span>{lists.filter(l => !l.isCreator).length} gedeeld</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 xl:space-x-6">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && createList()}
                      placeholder="Naam van je boodschappenlijst..."
                      className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-[rgb(var(--border-color))]/30 rounded-xl lg:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] text-base lg:text-lg placeholder:text-[rgb(var(--text-color))]/40 transition-all duration-200 group-hover:border-[rgb(var(--border-color))]/50"
                    />
                    <div className="absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                  </div>
                  <button
                    onClick={createList}
                    disabled={!newListName.trim()}
                    className="flex items-center justify-center px-6 lg:px-8 xl:px-10 py-3 lg:py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg transition-all duration-200 font-semibold text-base lg:text-lg whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3" />
                    <span>Lijst Aanmaken</span>
                  </button>
                </div>
              </motion.div>

              {/* Lists Grid - Enhanced for Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6 xl:gap-8">
              {lists.map((list) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8 hover:shadow-2xl hover:border-[rgb(var(--border-color))]/40 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  onClick={() => setSelectedList(list)}
                >
                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 lg:mb-6">
                      <div className="flex-1 pr-4">
                        <h3 className="text-lg lg:text-xl xl:text-2xl font-bold text-[rgb(var(--card-text))] mb-2 group-hover:text-primary transition-colors duration-200">
                          {list.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-[rgb(var(--text-color))]/60">
                          <span>{list.items.length} item{list.items.length !== 1 ? 's' : ''}</span>
                          {list.sharedWith && list.sharedWith.length > 0 && (
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {list.sharedWith.length} gedeeld
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                          list.isCreator
                            ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20'
                            : 'bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary border border-secondary/20'
                        }`}>
                          {list.isCreator ? 'Eigenaar' : 'Gedeeld'}
                        </span>
                        {list.updatedAt && (
                          <span className="text-xs text-[rgb(var(--text-color))]/40">
                            {(() => {
                              const date = list.updatedAt.toDate ? list.updatedAt.toDate() : new Date(list.updatedAt);
                              const now = new Date();
                              const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
                              if (diffHours < 1) return 'Zojuist';
                              if (diffHours < 24) return `${diffHours}u geleden`;
                              return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
                            })()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Items */}
                    {list.items.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[rgb(var(--text-color))]/60">Voortgang</span>
                          <span className="text-xs font-medium text-[rgb(var(--card-text))]">
                            {Math.round((list.items.filter(item => item.completed).length / list.items.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-[rgb(var(--border-color))]/20 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(list.items.filter(item => item.completed).length / list.items.length) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Primary Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedList(list);
                        }}
                        className="w-full flex items-center justify-center px-4 py-3 lg:py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-base lg:text-lg"
                      >
                        <Check className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
                        <span>Lijst Openen</span>
                      </button>
                      
                      {/* Secondary Actions */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(list.id);
                          }}
                          className="w-full flex items-center justify-center px-4 py-3 lg:py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-base lg:text-lg"
                          title="Delen"
                        >
                          <Share2 className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
                          <span>Delen</span>
                        </button>
                        
                        {list.isCreator && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserManagement(list.id);
                            }}
                            className="w-full flex items-center justify-center px-4 py-2.5 lg:py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium text-sm lg:text-base"
                            title="Gebruikers beheren"
                          >
                            <Users className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                            <span>Gebruikers</span>
                          </button>
                        )}
                        
                        {canDeleteList(list) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteList(list.id);
                            }}
                            className="w-full flex items-center justify-center px-4 py-2.5 lg:py-3 bg-accent hover:opacity-90 text-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium text-sm lg:text-base"
                            title="Verwijderen"
                          >
                            <Trash2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                            <span>Verwijderen</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {lists.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full"
              >
                <div className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-12 lg:p-16 xl:p-20 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8">
                      <List className="w-10 h-10 lg:w-12 lg:h-12 text-primary" />
                    </div>
                    
                    <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--card-text))] mb-4 lg:mb-6">
                      Welkom bij Boodschappenlijst!
                    </h3>
                    
                    <p className="text-[rgb(var(--text-color))]/60 mb-8 lg:mb-10 text-base lg:text-lg leading-relaxed">
                      Je hebt nog geen lijsten. Begin door een nieuwe lijst aan te maken of scan een gedeelde lijst van iemand anders.
                    </p>
                    
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center items-center">
                      <button
                        onClick={() => setShowScanner(true)}
                        className="flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-base lg:text-lg"
                      >
                        <QrCode className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
                        <span>Scan Gedeelde Lijst</span>
                      </button>
                      
                      <div className="flex items-center space-x-4 text-[rgb(var(--text-color))]/40">
                        <div className="w-12 h-px bg-[rgb(var(--border-color))]/30"></div>
                        <span className="text-sm lg:text-base font-medium">of</span>
                        <div className="w-12 h-px bg-[rgb(var(--border-color))]/30"></div>
                      </div>
                      
                      <p className="text-[rgb(var(--text-color))]/60 text-sm lg:text-base">
                        Maak hierboven een nieuwe lijst aan
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            </div>

            {/* Desktop Sidebar - Quick Actions & Analytics */}
            <div className="hidden lg:block lg:w-80 xl:w-96">
              <div className="sticky top-8 space-y-6">
                {/* Quick Stats Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6"
                >
                  <h3 className="text-lg font-bold text-[rgb(var(--card-text))] mb-4 flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Overzicht
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[rgb(var(--text-color))]/70 text-sm">Totaal lijsten</span>
                      <span className="font-semibold text-[rgb(var(--card-text))]">{lists.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgb(var(--text-color))]/70 text-sm">Eigenaar van</span>
                      <span className="font-semibold text-primary">{lists.filter(l => l.isCreator).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgb(var(--text-color))]/70 text-sm">Gedeeld met jou</span>
                      <span className="font-semibold text-secondary">{lists.filter(l => !l.isCreator).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgb(var(--text-color))]/70 text-sm">Totaal items</span>
                      <span className="font-semibold text-accent">
                        {lists.reduce((sum, list) => sum + (list.items || []).length, 0)}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Actions Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6"
                >
                  <h3 className="text-lg font-bold text-[rgb(var(--card-text))] mb-4 flex items-center">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                    Snelle acties
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowScanner(true)}
                      className="w-full flex items-center px-4 py-3 bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <QrCode className="w-5 h-5 mr-3" />
                      <span className="font-medium">QR Scanner</span>
                    </button>
                    
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-full flex items-center px-4 py-3 bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--card-text))] rounded-xl transition-all duration-200"
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      <span className="font-medium">Instellingen & Analytics</span>
                    </button>
                  </div>
                </motion.div>

                {/* Recent Activity Card */}
                {lists.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6"
                  >
                    <h3 className="text-lg font-bold text-[rgb(var(--card-text))] mb-4 flex items-center">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                      Recente activiteit
                    </h3>
                    
                    <div className="space-y-3">
                      {lists
                        .filter(list => list.updatedAt)
                        .sort((a, b) => {
                          const dateA = a.updatedAt.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt);
                          const dateB = b.updatedAt.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
                          return dateB - dateA;
                        })
                        .slice(0, 3)
                        .map((list, index) => (
                          <div
                            key={list.id}
                            className="flex items-center space-x-3 p-3 rounded-xl bg-[rgb(var(--border-color))]/10 hover:bg-[rgb(var(--border-color))]/20 transition-colors cursor-pointer"
                            onClick={() => setSelectedList(list)}
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[rgb(var(--card-text))] truncate text-sm">
                                {list.name}
                              </p>
                              <p className="text-xs text-[rgb(var(--text-color))]/60">
                                {list.items?.length || 0} items • {list.isCreator ? 'Eigenaar' : 'Gedeeld'}
                              </p>
                            </div>
                          </div>
                        ))}
                      
                      {lists.filter(list => list.updatedAt).length === 0 && (
                        <p className="text-sm text-[rgb(var(--text-color))]/60 text-center py-4">
                          Geen recente activiteit
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
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
        <SettingsModal
          lists={lists}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showShare && (
        <QRShareModal
          listId={shareListId}
          list={lists.find(l => l.id === shareListId)}
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

      {showUserManagement && (
        <UserManagementModal
          list={lists.find(l => l.id === managementListId)}
          onClose={() => {
            setShowUserManagement(false);
            setManagementListId(null);
          }}
          onListUpdate={(updatedList) => {
            setLists(lists.map(l => l.id === updatedList.id ? updatedList : l));
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