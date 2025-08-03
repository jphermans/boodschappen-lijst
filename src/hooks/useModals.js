import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal states
 * Extracted from App.jsx to improve code organization and reusability
 */
export const useModals = () => {
  // Modal visibility states
  const [showShare, setShowShare] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showUserNameModal, setShowUserNameModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Modal data states
  const [shareListId, setShareListId] = useState(null);
  const [managementListId, setManagementListId] = useState(null);
  const [listToDelete, setListToDelete] = useState(null);

  /**
   * Open share modal for a specific list
   */
  const openShareModal = useCallback((listId) => {
    setShareListId(listId);
    setShowShare(true);
  }, []);

  /**
   * Close share modal
   */
  const closeShareModal = useCallback(() => {
    setShowShare(false);
    setShareListId(null);
  }, []);

  /**
   * Open QR scanner modal
   */
  const openScannerModal = useCallback(() => {
    setShowScanner(true);
  }, []);

  /**
   * Close QR scanner modal
   */
  const closeScannerModal = useCallback(() => {
    setShowScanner(false);
  }, []);

  /**
   * Open user management modal for a specific list
   */
  const openUserManagementModal = useCallback((listId) => {
    setManagementListId(listId);
    setShowUserManagement(true);
  }, []);

  /**
   * Close user management modal
   */
  const closeUserManagementModal = useCallback(() => {
    setShowUserManagement(false);
    setManagementListId(null);
  }, []);

  /**
   * Open user name modal
   */
  const openUserNameModal = useCallback(() => {
    setShowUserNameModal(true);
  }, []);

  /**
   * Close user name modal
   */
  const closeUserNameModal = useCallback(() => {
    setShowUserNameModal(false);
  }, []);

  /**
   * Open delete confirmation modal for a specific list
   */
  const openDeleteConfirmation = useCallback((list) => {
    setListToDelete(list);
    setShowDeleteConfirmation(true);
  }, []);

  /**
   * Close delete confirmation modal
   */
  const closeDeleteConfirmation = useCallback(() => {
    setShowDeleteConfirmation(false);
    setListToDelete(null);
  }, []);

  /**
   * Close all modals
   */
  const closeAllModals = useCallback(() => {
    setShowShare(false);
    setShowScanner(false);
    setShowUserManagement(false);
    setShowUserNameModal(false);
    setShowDeleteConfirmation(false);
    setShareListId(null);
    setManagementListId(null);
    setListToDelete(null);
  }, []);

  /**
   * Check if any modal is open
   */
  const isAnyModalOpen = useCallback(() => {
    return showShare || showScanner || showUserManagement || showUserNameModal || showDeleteConfirmation;
  }, [showShare, showScanner, showUserManagement, showUserNameModal, showDeleteConfirmation]);

  return {
    // Modal visibility states
    showShare,
    showScanner,
    showUserManagement,
    showUserNameModal,
    showDeleteConfirmation,

    // Modal data states
    shareListId,
    managementListId,
    listToDelete,

    // Share modal actions
    openShareModal,
    closeShareModal,

    // Scanner modal actions
    openScannerModal,
    closeScannerModal,

    // User management modal actions
    openUserManagementModal,
    closeUserManagementModal,

    // User name modal actions
    openUserNameModal,
    closeUserNameModal,

    // Delete confirmation modal actions
    openDeleteConfirmation,
    closeDeleteConfirmation,

    // Utility actions
    closeAllModals,
    isAnyModalOpen,

    // Direct state setters (for backward compatibility if needed)
    setShowShare,
    setShowScanner,
    setShowUserManagement,
    setShowUserNameModal,
    setShowDeleteConfirmation,
    setShareListId,
    setManagementListId,
    setListToDelete
  };
};