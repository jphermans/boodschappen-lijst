import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Check, Trash2, Share2 } from 'lucide-react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../context/ToastContext';
import { useUndo } from '../context/UndoContext';
import { getSuggestions, getPopularItems } from '../utils/groceryItems';
import { validateItemName } from '../utils/validation';

const ShoppingList = ({ list, onBack, onShare }) => {
  const { success, error, deleteToast, removeToastByMessage } = useToast();
  const { addUndoAction } = useUndo();
  const [newItem, setNewItem] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentList, setCurrentList] = useState(list);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setCurrentList(list);
    
    // Subscribe to real-time updates for this list
    const unsubscribe = onSnapshot(doc(db, 'shoppingLists', list.id), (doc) => {
      if (doc.exists()) {
        setCurrentList({
          id: doc.id,
          ...doc.data(),
          isCreator: list.isCreator // Preserve the isCreator property from the original list
        });
      }
    });

    return () => unsubscribe();
  }, [list.id, list.isCreator]);

  const addItem = async (itemName = newItem.trim()) => {
    const validation = validateItemName(itemName);
    if (!validation.valid) {
      error(validation.error);
      return;
    }

    try {
      // Check if item already exists to prevent duplicates
      const existingItem = currentList.items.find(item => 
        item.name.toLowerCase() === validation.value.toLowerCase()
      );
      
      if (existingItem) {
        error(`"${validation.value}" staat al op je lijst!`);
        return;
      }

      const newItemObj = {
        id: crypto.randomUUID(),
        name: validation.value,
        completed: false,
        addedAt: new Date(),
      };
      
      const updatedItems = [...currentList.items, newItemObj];
      await updateDoc(doc(db, 'shoppingLists', currentList.id), {
        items: updatedItems,
        updatedAt: new Date()
      });
      
      setNewItem('');
      setShowSuggestions(false);
      setSuggestions([]);
      success(`"${newItemObj.name}" toegevoegd! ✅`, 2000);
    } catch (err) {
      console.error('Error adding item:', err);
      error('Er ging iets mis bij het toevoegen van het item', 3000);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewItem(value);
    
    if (value.length >= 2) {
      const newSuggestions = getSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    addItem(suggestion);
  };

  const handleInputFocus = () => {
    if (newItem.length >= 2) {
      setShowSuggestions(suggestions.length > 0);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const toggleItem = async (itemId) => {
    const updatedItems = currentList.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    await updateDoc(doc(db, 'shoppingLists', currentList.id), {
      items: updatedItems,
      updatedAt: new Date()
    });
  };

  const deleteItem = async (itemId) => {
    try {
      const itemToDelete = currentList.items.find(item => item.id === itemId);
      const updatedItems = currentList.items.filter(item => item.id !== itemId);
      
      await updateDoc(doc(db, 'shoppingLists', currentList.id), {
        items: updatedItems,
        updatedAt: new Date()
      });
      
      const deleteMessage = `"${itemToDelete?.name}" verwijderd`;
      
      // Add undo action
      addUndoAction({
        message: deleteMessage,
        undoFunction: async () => {
          // Hide the deletion toast when undoing
          removeToastByMessage(deleteMessage);
          const restoreItems = [...updatedItems, itemToDelete];
          await updateDoc(doc(db, 'shoppingLists', currentList.id), {
            items: restoreItems,
            updatedAt: new Date()
          });
          success(`"${itemToDelete?.name}" hersteld! ✅`, 2000);
        }
      });
      
      success(deleteMessage, 6000);
    } catch (err) {
      console.error('Error deleting item:', err);
      error('Er ging iets mis bij het verwijderen van het item', 3000);
    }
  };

  const clearCompleted = async () => {
    try {
      const completedItems = currentList.items.filter(item => item.completed);
      const completedCount = completedItems.length;
      const updatedItems = currentList.items.filter(item => !item.completed);
      
      await updateDoc(doc(db, 'shoppingLists', currentList.id), {
        items: updatedItems,
        updatedAt: new Date()
      });
      
      const deleteMessage = `${completedCount} voltooide item${completedCount !== 1 ? 's' : ''} verwijderd! 🗑️`;
      
      // Add undo action
      addUndoAction({
        message: `${completedCount} voltooide item${completedCount !== 1 ? 's' : ''} verwijderd`,
        undoFunction: async () => {
          // Hide the deletion toast when undoing
          removeToastByMessage(deleteMessage);
          const restoreItems = [...updatedItems, ...completedItems];
          await updateDoc(doc(db, 'shoppingLists', currentList.id), {
            items: restoreItems,
            updatedAt: new Date()
          });
          success(`${completedCount} item${completedCount !== 1 ? 's' : ''} hersteld! ✅`, 2000);
        }
      });
      
      success(deleteMessage, 8000);
    } catch (err) {
      console.error('Error clearing completed items:', err);
      error('Er ging iets mis bij het verwijderen van voltooide items', 3000);
    }
  };

  const filteredItems = currentList.items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'active') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const completedCount = currentList.items.filter(item => item.completed).length;
  const totalCount = currentList.items.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto px-4 sm:px-0"
    >
      <div className="bg-[rgb(var(--card-bg))] rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center justify-center p-3 rounded-xl bg-[rgb(var(--border-color))]/60 hover:bg-[rgb(var(--border-color))]/80 text-[rgb(var(--card-text))] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-[rgb(var(--card-text))]">
              {currentList.name}
            </h2>
          </div>
          <button
            onClick={() => {
              if (onShare) {
                onShare(currentList.id);
              }
            }}
            className="flex items-center justify-center p-3 rounded-xl bg-secondary hover:opacity-90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            title="Lijst delen"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 relative">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newItem}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Voeg item toe... (bijv. melk, brood, appels)"
                className="w-full px-4 py-2 border border-[rgb(var(--border-color))] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))]"
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-[rgb(var(--card-bg))] border border-[rgb(var(--border-color))] rounded-lg shadow-lg z-10 mt-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-[rgb(var(--border-color))]/10 transition-colors first:rounded-t-lg last:rounded-b-lg text-[rgb(var(--card-text))]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => addItem()}
              disabled={!newItem.trim()}
              className="flex items-center justify-center px-6 py-3 bg-primary hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-medium">Toevoegen</span>
            </button>
          </div>
          
          {currentList.items.length === 0 && newItem.length === 0 && (
            <div className="mt-3">
              <p className="text-sm text-[rgb(var(--text-color))]/60 mb-2">Populaire items:</p>
              <div className="flex flex-wrap gap-2">
                {getPopularItems().map((item, index) => (
                  <button
                    key={index}
                    onClick={() => addItem(item)}
                    className="px-3 py-1 bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--text-color))]/80 rounded-lg text-sm transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { type: 'all', label: 'Alles', icon: '📋' },
              { type: 'active', label: 'Actief', icon: '⏳' },
              { type: 'completed', label: 'Voltooid', icon: '✅' }
            ].map((filterOption) => (
              <button
                key={filterOption.type}
                onClick={() => setFilter(filterOption.type)}
                className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === filterOption.type
                    ? 'bg-primary text-white shadow-lg transform scale-105'
                    : 'bg-[rgb(var(--border-color))]/20 text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/30 hover:scale-105'
                }`}
              >
                <span className="mr-1">{filterOption.icon}</span>
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 text-sm text-[rgb(var(--text-color))]/80">
          {completedCount} van {totalCount} items voltooid
        </div>

        <div className="space-y-2">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-3 p-3 bg-[rgb(var(--border-color))]/10 rounded-lg min-w-0"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 transform hover:scale-110 ${
                  item.completed
                                      ? 'bg-gradient-to-r from-primary to-primary border-primary shadow-lg'
                  : 'border-[rgb(var(--border-color))] hover:border-primary hover:bg-primary/10'
                }`}
              >
                {item.completed && <Check className="w-4 h-4 text-white" />}
              </button>
              <span
                className={`flex-1 min-w-0 break-words ${
                  item.completed
                    ? 'line-through text-[rgb(var(--text-color))]/60'
                    : 'text-[rgb(var(--card-text))]'
                }`}
              >
                {item.name}
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                className="flex items-center justify-center p-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent hover:text-accent transform hover:scale-110 transition-all duration-200 flex-shrink-0"
                title="Item verwijderen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {completedCount > 0 && (
          <div className="mt-6">
            <button
              onClick={clearCompleted}
              className="w-full flex items-center justify-center px-4 py-3 bg-accent hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              <span className="font-medium">Verwijder voltooide items ({completedCount})</span>
            </button>
          </div>
        )}

        {currentList.items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[rgb(var(--text-color))]/60">
              Je boodschappenlijst is leeg. Voeg items toe om te beginnen!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ShoppingList;