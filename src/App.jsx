import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, List, Wifi, Settings, BarChart3, Palette, Database, QrCode, Check, Share2, Users, Trash2 } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useToast } from './context/ToastContext';
import { isConnected } from './firebase';

// Lazy-loaded page components for code splitting
import {
  SettingsPage,
  AnalyticsPage,
  ThemePage,
  PersistencePage,
  ShoppingListPage,
  QRShareModal,
  QRScannerModal,
  UserManagementModal,
  preloadCriticalComponents
} from './components/LazyComponents';

// Non-lazy components (critical for initial load)
import UserNameModal from './components/UserNameModal';
import ConfirmationDialog from './components/ConfirmationDialog';
import ConnectionError from './components/ConnectionError';
import ToastContainer from './components/Toast';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import PerformanceDashboard from './components/PerformanceDashboard';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { useUserState } from './hooks/usePersistentState';
import { useUnifiedThemeContext } from './context/UnifiedThemeContext';
import { debugThemes } from './utils/debugThemes';
import errorHandler from './utils/errorHandler';

// Enhanced state management
import useAppState from './hooks/useAppState';

// Existing extracted components and hooks
import { useShoppingLists } from './hooks/useShoppingLists';
import { useListOperations } from './hooks/useListOperations';
import { useModals } from './hooks/useModals';
import ListCard from './components/ListCard/ListCard';
import Navigation from './components/Navigation/Navigation';

function App() {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL IN THE SAME ORDER EVERY TIME
  
  // Enhanced state management hooks - MOVED TO TOP
  const { userInfo, setUserName, isLoading: userLoading, error: userError } = useUserState();
  
  // Enhanced state management with reducers
  const {
    // App state
    getCurrentPage,
    getSelectedList,
    getNewListName,
    isNewListNameValid,
    getIsLoading,
    getError,
    hasError,
    isCreatingList,
    
    // List state
    getLists,
    getListsLoading,
    getListsError,
    getStats,
    
    // Actions
    setCurrentPage,
    setSelectedList,
    navigateToList,
    navigateToOverview,
    setNewListName,
    clearNewListName,
    setLoadingState,
    setErrorState,
    clearErrorState,
    setLists,
    addList,
    updateList,
    removeList,
    setListsLoading,
    setListsError,
    clearListsError,
    
    // Optimistic updates
    optimisticListCreateStart,
    optimisticListCreateSuccess,
    optimisticListCreateFailure,
    optimisticAddList,
    optimisticRemoveList,
    revertOptimisticAdd,
    revertOptimisticRemove,
    
    // Utilities
    getDebugInfo
  } = useAppState();
  
  // Unified theme context
  const { mode: theme, toggleMode: toggleTheme, isLoading: themeLoading } = useUnifiedThemeContext();
  
  // Legacy theme context for backward compatibility
  const { theme: legacyTheme, toggleTheme: legacyToggleTheme } = useTheme();
  const { toasts, removeToast, removeToastByMessage, success, error, info, deleteToast } = useToast();
  
  // Extracted hooks for better organization
  const {
    lists,
    listsLoading,
    isLoading,
    firebaseError,
    initializeLists,
    retryConnection,
    handleSharedListFromURL,
    getListStats
  } = useShoppingLists();
  
  const {
    isCreatingList: legacyIsCreatingList,
    isProcessingQRScan,
    createList,
    deleteList,
    handleQRScan,
    setIsProcessingQRScan
  } = useListOperations(lists, userInfo);
  
  const {
    showShare,
    showScanner,
    showUserManagement,
    showUserNameModal,
    showDeleteConfirmation,
    shareListId,
    managementListId,
    listToDelete,
    openShareModal,
    closeShareModal,
    openScannerModal,
    closeScannerModal,
    openUserManagementModal,
    closeUserManagementModal,
    openUserNameModal,
    closeUserNameModal,
    openDeleteConfirmation,
    closeDeleteConfirmation
  } = useModals();

  // Performance Dashboard state
  const [showPerformanceDashboard, setShowPerformanceDashboard] = React.useState(false);
  const openPerformanceDashboard = () => setShowPerformanceDashboard(true);
  const closePerformanceDashboard = () => setShowPerformanceDashboard(false);

  // Initialize global error handlers (errorHandler initializes itself)
  useEffect(() => {
    // errorHandler is already initialized when imported
    console.log('ErrorHandler is ready:', !!errorHandler);
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Preload critical components after initial render
  useEffect(() => {
    // Preload components that are likely to be used soon
    const timer = setTimeout(() => {
      preloadCriticalComponents();
    }, 2000); // Preload after 2 seconds to not interfere with initial load

    return () => clearTimeout(timer);
  }, []);

  // Get state values from reducers
  const currentPage = getCurrentPage;
  const selectedList = getSelectedList;
  const newListName = getNewListName;

  // Make debug function available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.debugThemes = debugThemes;
    }
  }, []);


  useEffect(() => {
    // Only initialize if user data is loaded
    if (!userLoading) {
      initializeLists();
    }
  }, [userLoading, userInfo, initializeLists]);

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
  }, [isLoading, firebaseError, lists, isProcessingQRScan, handleSharedListFromURL]);

  const handleUserNameSet = async (name) => {
    closeUserNameModal();
    
    try {
      // Use enhanced user manager to set name with retry
      await errorHandler.withRetry(
        () => setUserName(name),
        {
          operation: 'set_user_name',
          context: { name }
        }
      );
      
      // Initialize lists after name is set
      await initializeLists();
      
      success(`Welkom ${name}! Je kunt nu lijsten maken en delen. 🎉`);
    } catch (err) {
      console.error('Error setting user name:', err);
      const userMessage = errorHandler.getUserMessage(err, 'set_user_name');
      error(userMessage);
      errorHandler.logError(err, 'set_user_name', { name });
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    // Start optimistic update
    optimisticListCreateStart(newListName);
    
    try {
      const result = await createList(newListName);
      if (result.success) {
        // Success - the optimistic update will be cleared automatically
        optimisticListCreateSuccess();
      } else {
        // Failure - revert optimistic update
        optimisticListCreateFailure(result.error);
      }
    } catch (err) {
      // Error - revert optimistic update
      optimisticListCreateFailure(err.message || 'Failed to create list');
    }
  };

  // Helper function to check if user can delete a list
  const canDeleteList = (list) => {
    return list && list.isCreator;
  };

  const handleDeleteList = (listId) => {
    const list = lists.find(l => l.id === listId);
    if (list) {
      openDeleteConfirmation(list);
    }
  };

  const confirmDeleteList = async () => {
    if (!listToDelete) return;
    
    // Start optimistic update
    optimisticRemoveList(listToDelete.id);
    
    try {
      const result = await deleteList(listToDelete.id);
      if (result.success) {
        // Success - optimistic update is already applied
        closeDeleteConfirmation();
      } else {
        // Failure - revert optimistic update
        revertOptimisticRemove(listToDelete.id);
        error(result.error || 'Failed to delete list');
      }
    } catch (err) {
      // Error - revert optimistic update
      revertOptimisticRemove(listToDelete.id);
      error(err.message || 'Failed to delete list');
    }
  };

  const handleShare = (listId) => {
    openShareModal(listId);
    info('Deel de QR-code of link om je lijst te delen! 📤');
  };

  const handleUserManagement = (listId) => {
    openUserManagementModal(listId);
    info('Beheer gebruikers die toegang hebben tot je lijst 👥');
  };

  const handleScanSuccess = async (scannedData) => {
    await handleQRScan(scannedData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen-safe flex items-center justify-center bg-[rgb(var(--bg-color))] safe-area-all">
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
    // For testing purposes, allow bypassing Firebase error to test themes
    const isTestMode = window.location.search.includes('test=true');
    if (!isTestMode) {
      return (
        <ErrorBoundary message="Er ging iets mis met de boodschappenlijst applicatie. Probeer het opnieuw of herlaad de pagina.">
          <div className="min-h-screen-safe bg-[rgb(var(--bg-color))] transition-colors duration-300">
            {/* Safe area background extension */}
            <div className="fixed inset-x-0 top-0 h-[var(--safe-area-inset-top)] bg-[rgb(var(--card-bg))] z-50"></div>
            
            {/* Unified Navigation Header - Available even during Firebase errors */}
            <div className="fixed inset-x-0 top-0 z-50 bg-[rgb(var(--card-bg))] border-b border-[rgb(var(--border-color))]/20 px-3 sm:px-4 lg:px-6 py-3">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Left side - Title */}
                <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
                  <h1 className="text-lg sm:text-xl font-bold text-[rgb(var(--card-text))] truncate">
                    Boodschappenlijst
                  </h1>
                </div>
                
                {/* Right side - Navigation buttons */}
                <Navigation
                  currentPage={currentPage}
                  onNavigate={setCurrentPage}
                  onToggleTheme={toggleTheme}
                  onOpenScanner={openScannerModal}
                  onOpenPerformanceDashboard={openPerformanceDashboard}
                  theme={theme || 'light'}
                  listsCount={lists.length}
                />
              </div>
            </div>
            
            {/* Main Content Area with Connection Error */}
            <main className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 xl:py-12 safe-area-x content-safe-area overflow-x-hidden" style={{ paddingTop: 'calc(var(--header-height) + 1rem)' }}>
              <ConnectionError error={firebaseError} onRetry={retryConnection} />
            </main>
            
            {/* Performance Dashboard - Controlled by state even during Firebase errors */}
            {showPerformanceDashboard && (
              <PerformanceDashboard onClose={closePerformanceDashboard} />
            )}
          </div>
        </ErrorBoundary>
      );
    }
    // In test mode, continue with mock lists for testing
    if (isTestMode && lists.length === 0) {
      const mockLists = [
        {
          id: 'test-1',
          name: 'Test Lijst voor Delete',
          items: [
            { id: '1', text: 'Melk', completed: false },
            { id: '2', text: 'Brood', completed: true },
            { id: '3', text: 'Eieren', completed: false }
          ],
          creatorName: 'Test Gebruiker',
          creatorId: 'test-user-id',
          isCreator: true,
          updatedAt: new Date(),
          sharedWith: []
        },
        {
          id: 'test-2',
          name: 'Gedeelde Lijst',
          items: [
            { id: '1', text: 'Appels', completed: false },
            { id: '2', text: 'Bananen', completed: true }
          ],
          creatorName: 'Andere Gebruiker',
          creatorId: 'other-user-id',
          isCreator: false,
          updatedAt: new Date(),
          sharedWith: ['test-user-id']
        }
      ];
      // setLists(mockLists); // This should be handled by the hook
    }
  }

  const isOffline = !isConnected;

  return (
    <ErrorBoundary message="Er ging iets mis met de boodschappenlijst applicatie. Probeer het opnieuw of herlaad de pagina.">
      <div className="min-h-screen-safe bg-[rgb(var(--bg-color))] transition-colors duration-300">
      {/* Safe area background extension */}
      <div className="fixed inset-x-0 top-0 h-[var(--safe-area-inset-top)] bg-[rgb(var(--card-bg))] z-50"></div>
      
      {/* Unified Navigation Header */}
      <div className="fixed inset-x-0 top-0 z-50 bg-[rgb(var(--card-bg))] border-b border-[rgb(var(--border-color))]/20 px-3 sm:px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left side - Title */}
          <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-bold text-[rgb(var(--card-text))] truncate">
              Boodschappenlijst
            </h1>
          </div>
          
          {/* Right side - Navigation buttons */}
          <Navigation
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onToggleTheme={toggleTheme}
            onOpenScanner={openScannerModal}
            onOpenPerformanceDashboard={openPerformanceDashboard}
            theme={theme}
            listsCount={lists.length}
          />
        </div>
      </div>

      {/* Main Content Area - Mobile Optimized */}
      <main className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 xl:py-12 safe-area-x content-safe-area overflow-x-hidden" style={{ paddingTop: 'calc(var(--header-height) + 1rem)' }}>
        {currentPage === 'settings' ? (
          <SettingsPage
            lists={lists}
            onBack={() => setCurrentPage('overview')}
            onNavigateToAnalytics={() => setCurrentPage('analytics')}
            onNavigateToTheme={() => setCurrentPage('theme')}
            onNavigateToPersistence={() => setCurrentPage('persistence')}
          />
        ) : currentPage === 'analytics' ? (
          <AnalyticsPage
            lists={lists}
            onBack={() => setCurrentPage('overview')}
          />
        ) : currentPage === 'theme' ? (
          <ThemePage
            onBack={() => setCurrentPage('overview')}
          />
        ) : currentPage === 'persistence' ? (
          <PersistencePage
            onBack={() => setCurrentPage('overview')}
          />
        ) : currentPage === 'list' && selectedList ? (
          <ShoppingListPage
            list={selectedList}
            onBack={() => setCurrentPage('overview')}
            onListUpdate={(updatedList) => {
              // Firebase subscription will handle the list update automatically
              setSelectedList(updatedList);
            }}
          />
        ) : (
          <div className="w-full md:flex md:space-x-6 lg:space-x-8 xl:space-x-12">
            {/* Main Content Area */}
            <div className="w-full flex-1 min-w-0 md:min-w-[400px]">
              {/* Create New List Section - Mobile Optimized */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[rgb(var(--card-bg))] rounded-xl sm:rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-4 sm:p-6 lg:p-8 xl:p-10 mb-6 sm:mb-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 lg:mb-8">
                  <div className="mb-4 sm:mb-0 min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--card-text))] mb-1 sm:mb-2 ipad-simple-fix">
                      Nieuwe lijst maken
                    </h2>
                    <p className="text-[rgb(var(--text-color))]/60 text-sm lg:text-base ipad-simple-fix">
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
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4 xl:space-x-6">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                      placeholder="Naam van je boodschappenlijst..."
                      className="w-full px-3 sm:px-4 lg:px-6 py-3 lg:py-4 border-2 border-[rgb(var(--border-color))]/30 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] text-sm sm:text-base lg:text-lg placeholder:text-[rgb(var(--text-color))]/40 transition-all duration-200 group-hover:border-[rgb(var(--border-color))]/50 touch-manipulation"
                    />
                    <div className="absolute inset-0 rounded-lg sm:rounded-xl lg:rounded-2xl bg-[rgb(var(--primary-color))]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                  </div>
                  <button
                    onClick={handleCreateList}
                    disabled={!isNewListNameValid || isCreatingList}
                    className="flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-10 py-3 lg:py-4 bg-[rgb(var(--color-primary-button))] hover:opacity-90 text-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform active:scale-95 sm:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg transition-all duration-200 font-semibold text-sm sm:text-base lg:text-lg whitespace-nowrap touch-manipulation"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3" />
                    <span>{isCreatingList ? 'Bezig...' : 'Lijst Aanmaken'}</span>
                  </button>
                </div>
              </motion.div>

              {/* Lists Grid - Using ListCard Component */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-4 xl:gap-6">
                {lists.map((list) => (
                  <ListCard
                    key={list.id}
                    list={list}
                    onOpen={navigateToList}
                    onShare={handleShare}
                    onUserManagement={handleUserManagement}
                    onDelete={handleDeleteList}
                    canDelete={canDeleteList(list)}
                  />
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
                    
                    <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--card-text))] mb-4 lg:mb-6 ipad-simple-fix">
                      Welkom bij Boodschappenlijst!
                    </h3>
                    
                    <p className="text-[rgb(var(--text-color))]/60 mb-8 lg:mb-10 text-base lg:text-lg leading-relaxed ipad-simple-fix">
                      Je hebt nog geen lijsten. Begin door een nieuwe lijst aan te maken of scan een gedeelde lijst van iemand anders.
                    </p>
                    
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center items-center">
                      <button
                        onClick={() => openScannerModal()}
                        className="flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 bg-[rgb(var(--color-secondary-button))] hover:opacity-90 text-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-base lg:text-lg"
                      >
                        <QrCode className="w-5 h-5 lg:w-6 lg:h-6 mr-3" />
                        <span>Scan Gedeelde Lijst</span>
                      </button>
                      
                      <div className="flex items-center space-x-4 text-[rgb(var(--text-color))]/40">
                        <div className="w-12 h-px bg-[rgb(var(--border-color))]/30"></div>
                        <span className="text-sm lg:text-base font-medium">of</span>
                        <div className="w-12 h-px bg-[rgb(var(--border-color))]/30"></div>
                      </div>
                      
                      <p className="text-[rgb(var(--text-color))]/60 text-sm lg:text-base ipad-simple-fix">
                        Maak hierboven een nieuwe lijst aan
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            </div>

            {/* Tablet/Desktop Sidebar - Quick Actions & Analytics */}
            <div className="hidden md:block md:w-72 lg:w-80 xl:w-96 flex-shrink-0">
              <div className="sticky top-8 space-y-4 md:space-y-6">
                {/* Quick Stats Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[rgb(var(--card-bg))] rounded-xl md:rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-4 md:p-6"
                >
                  <h3 className="text-base md:text-lg font-bold text-[rgb(var(--card-text))] mb-3 md:mb-4 flex items-center ipad-simple-fix">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    Overzicht
                  </h3>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[rgb(var(--text-color))]/70 text-xs md:text-sm">Totaal lijsten</span>
                      <span className="font-semibold text-[rgb(var(--card-text))] text-sm md:text-base">{lists.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgb(var(--text-color))]/70 text-xs md:text-sm">Eigenaar van</span>
                      <span className="font-semibold text-primary text-sm md:text-base">{lists.filter(l => l.isCreator).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgb(var(--text-color))]/70 text-xs md:text-sm">Gedeeld met jou</span>
                      <span className="font-semibold text-secondary text-sm md:text-base">{lists.filter(l => !l.isCreator).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[rgb(var(--text-color))]/70 text-xs md:text-sm">Totaal items</span>
                      <span className="font-semibold text-accent text-sm md:text-base">
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
                  className="bg-[rgb(var(--card-bg))] rounded-xl md:rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-4 md:p-6"
                >
                  <h3 className="text-base md:text-lg font-bold text-[rgb(var(--card-text))] mb-3 md:mb-4 flex items-center ipad-simple-fix">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                    Snelle acties
                  </h3>
                  
                  <div className="space-y-2 md:space-y-3">
                    <button
                      onClick={() => openScannerModal()}
                      className="w-full flex items-center px-3 md:px-4 py-2 md:py-3 bg-[rgb(var(--color-secondary-button))] hover:opacity-90 text-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <QrCode className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                      <span className="font-medium text-sm md:text-base">QR Scanner</span>
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage('settings')}
                      className="w-full flex items-center px-3 md:px-4 py-2 md:py-3 bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--card-text))] rounded-lg md:rounded-xl transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                      <span className="font-medium text-sm md:text-base">Instellingen & Analytics</span>
                    </button>
                  </div>
                </motion.div>

                {/* Theme Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-[rgb(var(--card-bg))] rounded-xl md:rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-4 md:p-6"
                >
                  <h3 className="text-base md:text-lg font-bold text-[rgb(var(--card-text))] mb-3 md:mb-4 flex items-center ipad-simple-fix">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Thema Instellingen
                  </h3>
                  
                  <div className="space-y-2 md:space-y-3">
                    <p className="text-xs md:text-sm text-[rgb(var(--text-color))]/60 ipad-simple-fix">
                      Pas het uiterlijk van de app aan naar jouw voorkeur
                    </p>
                    <button
                      onClick={() => setCurrentPage('theme')}
                      className="w-full flex items-center px-3 md:px-4 py-2 md:py-3 bg-[rgb(var(--color-accent-button))] hover:opacity-90 text-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <span className="font-medium text-sm md:text-base">Thema Aanpassen</span>
                    </button>
                  </div>
                </motion.div>

                {/* Persistence Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[rgb(var(--card-bg))] rounded-xl md:rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-4 md:p-6"
                >
                  <h3 className="text-base md:text-lg font-bold text-[rgb(var(--card-text))] mb-3 md:mb-4 flex items-center ipad-simple-fix">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Data & Backup
                  </h3>
                  
                  <div className="space-y-2 md:space-y-3">
                    <p className="text-xs md:text-sm text-[rgb(var(--text-color))]/60 ipad-simple-fix">
                      Beheer je data en maak back-ups
                    </p>
                    <button
                      onClick={() => setCurrentPage('persistence')}
                      className="w-full flex items-center px-3 md:px-4 py-2 md:py-3 bg-[rgb(var(--color-info-button))] hover:opacity-90 text-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <span className="font-medium text-sm md:text-base">Data Beheren</span>
                    </button>
                  </div>
                </motion.div>

                {/* Recent Activity Card */}
                {lists.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[rgb(var(--card-bg))] rounded-xl md:rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-4 md:p-6"
                  >
                    <h3 className="text-base md:text-lg font-bold text-[rgb(var(--card-text))] mb-3 md:mb-4 flex items-center ipad-simple-fix">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                      Recente activiteit
                    </h3>
                    
                    <div className="space-y-2 md:space-y-3">
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
                            className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg md:rounded-xl bg-[rgb(var(--border-color))]/10 hover:bg-[rgb(var(--border-color))]/20 transition-colors cursor-pointer"
                            onClick={() => navigateToList(list)}
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[rgb(var(--card-text))] break-words text-xs md:text-sm ipad-simple-fix">
                                {list.name}
                              </p>
                              <p className="text-xs text-[rgb(var(--text-color))]/60 ipad-simple-fix">
                                {list.items?.length || 0} items • {list.isCreator ? 'Eigenaar' : 'Gedeeld'}
                              </p>
                            </div>
                          </div>
                        ))}
                      
                      {lists.filter(list => list.updatedAt).length === 0 && (
                        <p className="text-xs md:text-sm text-[rgb(var(--text-color))]/60 text-center py-3 md:py-4 ipad-simple-fix">
                          Geen recente activiteit
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {isOffline && (
        <div className="fixed bottom-20 right-4 bg-[rgb(var(--warning-color))] text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 mobile-touch-safe mr-safe">
          <Wifi className="w-4 h-4" />
          <span className="text-sm">Offline mode</span>
        </div>
      )}


      {showShare && (
        <QRShareModal
          listId={shareListId}
          list={lists.find(l => l.id === shareListId)}
          onClose={closeShareModal}
        />
      )}

      {showScanner && (
        <QRScannerModal
          onClose={closeScannerModal}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {showUserManagement && (
        <UserManagementModal
          list={lists.find(l => l.id === managementListId)}
          onClose={closeUserManagementModal}
          onListUpdate={(updatedList) => {
            // Firebase subscription will handle the list update automatically
            // No manual local state updates needed
          }}
        />
      )}

      {showUserNameModal && (
        <UserNameModal
          onNameSet={handleUserNameSet}
        />
      )}

      {showDeleteConfirmation && listToDelete && (
        <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          onClose={closeDeleteConfirmation}
          onConfirm={confirmDeleteList}
          title="Lijst verwijderen"
          message={`Weet je zeker dat je de lijst "${listToDelete.name}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
          confirmText="Verwijderen"
          cancelText="Annuleren"
          type="danger"
        />
      )}

        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <PWAUpdateNotification />
        
        {/* Performance Dashboard - Controlled by state */}
        {showPerformanceDashboard && (
          <PerformanceDashboard onClose={closePerformanceDashboard} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;