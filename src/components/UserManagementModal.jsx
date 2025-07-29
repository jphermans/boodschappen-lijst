import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Users, UserMinus, Shield, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { removeUserFromList, getCurrentUserID } from '../firebase';

const UserManagementModal = ({ list, onClose, onListUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const { success, error, info } = useToast();

  // Get current user ID
  const currentUserId = getCurrentUserID();

  // Check if current user is the list owner
  const isOwner = list.creatorId === currentUserId || list.deviceUID === currentUserId;

  // Get shared users info
  const sharedUsers = list.sharedWith || [];
  const totalUsers = sharedUsers.length + 1; // +1 for the owner

  const handleRemoveUser = async (userIdToRemove) => {
    if (!isOwner) {
      error('Alleen de eigenaar kan gebruikers verwijderen');
      return;
    }

    try {
      setRemovingUserId(userIdToRemove);
      setIsLoading(true);

      console.log('🗑️ Removing user access:', userIdToRemove, 'from list:', list.id);
      
      await removeUserFromList(list.id, userIdToRemove);
      
      // Update the local list data
      const updatedList = {
        ...list,
        sharedWith: list.sharedWith.filter(userId => userId !== userIdToRemove)
      };
      
      if (onListUpdate) {
        onListUpdate(updatedList);
      }
      
      success('Gebruikerstoegang ingetrokken! 🚫');
      info('De gebruiker heeft geen toegang meer tot deze lijst');
      
    } catch (err) {
      console.error('Error removing user:', err);
      error('Er ging iets mis bij het intrekken van de toegang');
    } finally {
      setIsLoading(false);
      setRemovingUserId(null);
    }
  };

  const formatUserId = (userId) => {
    // Show first 8 characters of user ID for identification
    return userId ? `${userId.substring(0, 8)}...` : 'Onbekend';
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Onbekend';
    
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - time;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Vandaag';
    if (diffDays === 1) return 'Gisteren';
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
    return `${Math.floor(diffDays / 30)} maanden geleden`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start lg:pt-[88px] justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-xl w-full max-w-md max-h-[calc(100vh-88px)] flex flex-col mt-0"
        onClick={(e) => e.stopPropagation()}
        style={{ overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-color))]/50">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-[rgb(var(--card-text))]">
                Gebruikersbeheer
              </h2>
              <p className="text-sm text-[rgb(var(--text-color))]/60">
                {list.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--border-color))]/20 transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--text-color))]/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[rgb(var(--border-color))]/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalUsers}</div>
              <div className="text-sm text-[rgb(var(--text-color))]/60">Totaal gebruikers</div>
            </div>
            <div className="bg-[rgb(var(--border-color))]/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{sharedUsers.length}</div>
              <div className="text-sm text-[rgb(var(--text-color))]/60">Gedeeld met</div>
            </div>
          </div>

          {/* Owner Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Eigenaar
            </h3>
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-[rgb(var(--card-text))]">
                      {currentUserId === (list.creatorId || list.deviceUID) ? 'Jij' : 'Andere gebruiker'}
                    </div>
                    <div className="text-sm text-[rgb(var(--text-color))]/60">
                      ID: {formatUserId(list.creatorId || list.deviceUID)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">Volledige toegang</div>
                  <div className="text-xs text-[rgb(var(--text-color))]/60">
                    Sinds {getTimeAgo(list.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shared Users Section */}
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2 text-secondary" />
              Gedeelde gebruikers ({sharedUsers.length})
            </h3>
            
            {sharedUsers.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-[rgb(var(--text-color))]/40 mx-auto mb-3" />
                <p className="text-[rgb(var(--text-color))]/60 mb-2">
                  Deze lijst is nog niet gedeeld
                </p>
                <p className="text-sm text-[rgb(var(--text-color))]/40">
                  Gebruik de deel-functie om anderen toegang te geven
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedUsers.map((userId, index) => (
                  <div
                    key={userId}
                    className="bg-[rgb(var(--border-color))]/10 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <div className="font-medium text-[rgb(var(--card-text))]">
                            Gebruiker {index + 1}
                          </div>
                          <div className="text-sm text-[rgb(var(--text-color))]/60">
                            ID: {formatUserId(userId)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-3">
                          <div className="text-sm font-medium text-secondary">Lees/schrijf toegang</div>
                          <div className="text-xs text-[rgb(var(--text-color))]/60">
                            Toegevoegd via delen
                          </div>
                        </div>
                        {isOwner && (
                          <button
                            onClick={() => handleRemoveUser(userId)}
                            disabled={isLoading || removingUserId === userId}
                            className="flex items-center justify-center w-10 h-10 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Toegang intrekken"
                          >
                            {removingUserId === userId ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                            ) : (
                              <UserMinus className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warning for non-owners */}
          {!isOwner && (
            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                    Beperkte toegang
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-300">
                    Alleen de eigenaar van de lijst kan gebruikers beheren en toegang intrekken.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[rgb(var(--border-color))]/50 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[rgb(var(--text-color))]/60">
              <Calendar className="w-4 h-4 inline mr-1" />
              Lijst aangemaakt {getTimeAgo(list.createdAt)}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--card-text))] rounded-lg transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserManagementModal;