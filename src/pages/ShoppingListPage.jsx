import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Check, X, Edit3, Share2, Trash2, Users, Save, RotateCcw } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { 
  updateShoppingList,
  getListById,
  shareListWithUser,
  removeUserFromList,
  canDeleteList,
  canEditList
} from '../firebase';
import { getCurrentUserID } from '../firebase';
import QRShareModal from '../components/QRShareModal';
import UserManagementModal from '../components/UserManagementModal';

const ShoppingListPage = ({ list, onBack, onListUpdate }) => {
  const [items, setItems] = useState(list?.items || []);
  const [newItemName, setNewItemName] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [listName, setListName] = useState(list?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempListName, setTempListName] = useState(list?.name || '');
  
  const { success, error, info } = useToast();

  const userID = getCurrentUserID();
  const canEdit = canEditList(list, userID);
  const canDelete = canDeleteList(list, userID);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!list?.id) return;

    const loadListData = async () => {
      try {
        const updatedList = await getListById(list.id);
        if (updatedList) {
          setItems(updatedList.items || []);
          setListName(updatedList.name);
          setTempListName(updatedList.name);
          if (onListUpdate) {
            onListUpdate(updatedList);
          }
        }
      } catch (err) {
        console.error('Error loading list:', err);
      }
    };

    // Load data on mount and when list changes
    loadListData();
  }, [list?.id, onListUpdate]);

  const addItem = async () => {
    if (!newItemName.trim() || !canEdit) return;

    // Check for duplicate items
    const normalizedName = newItemName.trim().toLowerCase();
    const duplicate = items.some(item => item.name.toLowerCase().trim() === normalizedName);
    if (duplicate) {
      error(`"${newItemName.trim()}" staat al in de lijst!`, 2000);
      return;
    }

    setIsLoading(true);
    try {
      const newItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newItemName.trim(),
        completed: false,
        addedAt: new Date(),
        addedBy: userID
      };

      const updatedItems = [...items, newItem];
      await updateShoppingList(list.id, { items: updatedItems });
      
      setItems(updatedItems);
      setNewItemName('');
      success(`"${newItem.name}" toegevoegd!`, 2000);
    } catch (err) {
      error('Kon item niet toevoegen');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = async (itemId) => {
    if (!canEdit) return;

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setIsLoading(true);
    try {
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      
      await updateShoppingList(list.id, { items: updatedItems });
      setItems(updatedItems);
      
      const updatedItem = updatedItems.find(i => i.id === itemId);
      success(updatedItem.completed ? `✅ "${updatedItem.name}" voltooid` : `⏪ "${updatedItem.name}" ongedaan gemaakt`);
    } catch (err) {
      error('Kon item niet bijwerken');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (itemId) => {
    if (!canEdit) return;

    const itemToDelete = items.find(i => i.id === itemId);
    if (!itemToDelete) return;

    setIsLoading(true);
    try {
      const updatedItems = items.filter(item => item.id !== itemId);
      await updateShoppingList(list.id, { items: updatedItems });
      setItems(updatedItems);
      success(`"${itemToDelete.name}" verwijderd`, 2000);
    } catch (err) {
      error('Kon item niet verwijderen');
    } finally {
      setIsLoading(false);
    }
  };

  const editItem = async (itemId) => {
    if (!canEdit) return;

    setIsLoading(true);
    try {
      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, name: editingItemName.trim() } : item
      );
      
      await updateShoppingList(list.id, { items: updatedItems });
      setItems(updatedItems);
      setEditingItemId(null);
      setEditingItemName('');
      success('Item bijgewerkt');
    } catch (err) {
      error('Kon item niet bijwerken');
    } finally {
      setIsLoading(false);
    }
  };

  const updateListName = async () => {
    if (!tempListName.trim() || !canEdit) return;

    setIsLoading(true);
    try {
      await updateShoppingList(list.id, { name: tempListName.trim() });
      setListName(tempListName.trim());
      setIsEditingName(false);
      success('Lijstnaam bijgewerkt');
    } catch (err) {
      error('Kon lijstnaam niet bijwerken');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    setShowShare(true);
    info('Deel de QR-code of link om je lijst te delen! 📤');
  };

  const handleUserManagement = () => {
    setShowUserManagement(true);
    info('Beheer gebruikers die toegang hebben tot je lijst 👥');
  };

  const completedCount = items.filter(item => item.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  if (!list) {
    return (
      <div className="min-h-screen-safe flex items-center justify-center bg-[rgb(var(--bg-color))]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[rgb(var(--card-text))] mb-2">Lijst niet gevonden</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Terug naar overzicht
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-safe bg-[rgb(var(--bg-color))] transition-colors duration-300">
      {/* Header */}
      <header className="fixed-top-safe bg-[rgb(var(--card-bg))] shadow-sm border-b border-[rgb(var(--border-color))]/20 header-safe-area">
        <div className="max-w-6xl mx-auto px-4 safe-area-x">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-3 py-2 bg-[rgb(var(--border-color))]/20 rounded-lg hover:bg-[rgb(var(--border-color))]/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Terug naar overzicht</span>
              </button>
              
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tempListName}
                    onChange={(e) => setTempListName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && updateListName()}
                    className="px-3 py-2 border border-[rgb(var(--border-color))]/50 rounded-lg bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <button
                    onClick={updateListName}
                    className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg"
                    disabled={isLoading}
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setTempListName(listName);
                    }}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <h1 
                  className="text-xl font-bold text-[rgb(var(--card-text))] cursor-pointer hover:text-primary transition-colors"
                  onClick={() => canEdit && setIsEditingName(true)}
                >
                  {listName}
                  {canEdit && <Edit3 className="w-4 h-4 inline ml-2 opacity-50" />}
                </h1>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-[rgb(var(--text-color))]/60">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              
              {list.isCreator && (
                <button
                  onClick={handleUserManagement}
                  className="p-2 text-[rgb(var(--card-text))] hover:bg-[rgb(var(--border-color))]/20 rounded-lg transition-colors"
                  title="Gebruikers beheren"
                >
                  <Users className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={handleShare}
                className="p-2 text-[rgb(var(--card-text))] hover:bg-[rgb(var(--border-color))]/20 rounded-lg transition-colors"
                title="Delen"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 content-safe-area" style={{ paddingTop: 'calc(var(--header-height) + 1.5rem)' }}>
        {/* Progress Bar */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[rgb(var(--card-text))]">Voortgang</span>
              <span className="text-sm text-[rgb(var(--text-color))]/60">
                {completedCount} van {items.length} voltooid
              </span>
            </div>
            <div className="w-full bg-[rgb(var(--border-color))]/20 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-center mt-2">
              <span className="text-lg font-bold text-[rgb(var(--card-text))]">{Math.round(progress)}%</span>
            </div>
          </motion.div>
        )}

        {/* Add Item Form */}
        {canEdit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-[rgb(var(--card-text))] mb-4">Item toevoegen</h2>
            <div className="flex space-x-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                placeholder="Wat wil je toevoegen?"
                className="flex-1 px-4 py-3 border-2 border-[rgb(var(--border-color))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] placeholder:text-[rgb(var(--text-color))]/40"
              />
              <button
                onClick={addItem}
                disabled={!newItemName.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-12 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--card-text))] mb-2">
                  {canEdit ? 'Begin met winkelen!' : 'Geen items in deze lijst'}
                </h3>
                <p className="text-[rgb(var(--text-color))]/60">
                  {canEdit 
                    ? 'Voeg je eerste item toe om te beginnen met je boodschappenlijst.' 
                    : 'Deze lijst bevat nog geen items.'}
                </p>
              </div>
            </motion.div>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-[rgb(var(--card-bg))] rounded-xl shadow-md border border-[rgb(var(--border-color))]/20 p-4 transition-all duration-200 ${
                  item.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleItem(item.id)}
                    disabled={!canEdit || isLoading}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      item.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-[rgb(var(--border-color))] hover:border-primary'
                    }`}
                  >
                    {item.completed && <Check className="w-4 h-4" />}
                  </button>

                  {editingItemId === item.id ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingItemName}
                        onChange={(e) => setEditingItemName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && editItem(item.id)}
                        className="flex-1 px-2 py-1 border border-[rgb(var(--border-color))]/50 rounded bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                      <button
                        onClick={() => editItem(item.id)}
                        className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                        disabled={isLoading}
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItemId(null);
                          setEditingItemName('');
                        }}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <span
                        className={`text-lg ${
                          item.completed
                            ? 'line-through text-[rgb(var(--text-color))]/50'
                            : 'text-[rgb(var(--card-text))]'
                        }`}
                      >
                        {item.name}
                      </span>
                      
                      {canEdit && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditingItemName(item.name);
                            }}
                            className="p-1 text-[rgb(var(--text-color))]/60 hover:text-primary transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-1 text-[rgb(var(--text-color))]/60 hover:text-red-500 transition-colors"
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Modals */}
      {showShare && (
        <QRShareModal
          listId={list.id}
          list={list}
          onClose={() => setShowShare(false)}
        />
      )}

      {showUserManagement && (
        <UserManagementModal
          list={list}
          onClose={() => setShowUserManagement(false)}
          onListUpdate={onListUpdate}
        />
      )}
    </div>
  );
};

export default ShoppingListPage;