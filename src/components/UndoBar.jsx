import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, X } from 'lucide-react';

const UndoBar = ({ undoActions, executeUndo, removeUndoAction }) => {
  if (undoActions.length === 0) return null;

  const latestAction = undoActions[undoActions.length - 1];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 flex justify-center"
      >
        <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border-color))] rounded-xl shadow-xl p-4 max-w-md w-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <Undo2 className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-[rgb(var(--card-text))]">
                {latestAction.message}
              </p>
              <p className="text-xs text-[rgb(var(--text-color))]/60">
                Klik om ongedaan te maken
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => executeUndo(latestAction.id)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-primary hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Undo2 className="w-3 h-3" />
              <span>Ongedaan maken</span>
            </button>
            <button
              onClick={() => removeUndoAction(latestAction.id)}
              className="p-1.5 text-[rgb(var(--text-color))]/60 hover:text-[rgb(var(--text-color))] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UndoBar; 