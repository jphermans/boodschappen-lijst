import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Check, Trash2, Share2 } from 'lucide-react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const ShoppingList = ({ list, onBack, onUpdateList }) => {
  const [newItem, setNewItem] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentList, setCurrentList] = useState(list);

  useEffect(() => {
    setCurrentList(list);
    
    // Subscribe to real-time updates for this list
    const unsubscribe = onSnapshot(doc(db, 'shoppingLists', list.id), (doc) => {
      if (doc.exists()) {
        setCurrentList({ id: doc.id, ...doc.data() });
      }
    });

    return () => unsubscribe();
  }, [list.id]);

  const addItem = async () => {
    if (newItem.trim()) {
      const newItemObj = {
        id: crypto.randomUUID(),
        name: newItem.trim(),
        completed: false,
        addedAt: new Date(),
      };
      
      const updatedItems = [...currentList.items, newItemObj];
      await updateDoc(doc(db, 'shoppingLists', currentList.id), {
        items: updatedItems,
        updatedAt: new Date()
      });
      
      setNewItem('');
    }
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
    const updatedItems = currentList.items.filter(item => item.id !== itemId);
    
    await updateDoc(doc(db, 'shoppingLists', currentList.id), {
      items: updatedItems,
      updatedAt: new Date()
    });
  };

  const clearCompleted = async () => {
    const updatedItems = currentList.items.filter(item => !item.completed);
    
    await updateDoc(doc(db, 'shoppingLists', currentList.id), {
      items: updatedItems,
      updatedAt: new Date()
    });
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentList.name}
            </h2>
          </div>
          <button
            onClick={() => {}}
            className="p-2 rounded-lg bg-secondary text-white hover:bg-secondary/90 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="Voeg item toe..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={addItem}
              disabled={!newItem.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'completed'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filter === filterType
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filterType === 'all' && 'Alles'}
                {filterType === 'active' && 'Actief'}
                {filterType === 'completed' && 'Voltooid'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {completedCount} van {totalCount} items voltooid
        </div>

        <div className="space-y-2">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-0"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  item.completed
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 dark:border-gray-500 hover:border-primary'
                }`}
              >
                {item.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span
                className={`flex-1 min-w-0 break-words ${
                  item.completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {item.name}
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
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
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Verwijder voltooide items ({completedCount})
            </button>
          </div>
        )}

        {currentList.items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Je boodschappenlijst is leeg. Voeg items toe om te beginnen!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ShoppingList;