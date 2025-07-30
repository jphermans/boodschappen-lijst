import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Check } from 'lucide-react';
import { userManager } from '../utils/userManager';
import { useToast } from '../context/ToastContext';

const UserNameModal = ({ onNameSet }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, success } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const validation = userManager.validateUserName(name);
    if (!validation.valid) {
      error(validation.error);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = userManager.setUserName(validation.value);
      if (success) {
        onNameSet(validation.value);
      } else {
        error('Er ging iets mis bij het opslaan van je naam');
      }
    } catch (err) {
      console.error('Error setting user name:', err);
      error('Er ging iets mis bij het opslaan van je naam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-[rgb(var(--card-text))] mb-2">
            Welkom bij Boodschappenlijst!
          </h2>
          <p className="text-[rgb(var(--text-color))]/70 leading-relaxed">
            Om samen te kunnen werken aan lijsten, hebben we je naam nodig. 
            Deze wordt getoond bij lijsten die je maakt en items die je toevoegt.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[rgb(var(--text-color))]/80 mb-2">
              Jouw naam
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Jan Janssen"
              className="w-full px-4 py-3 border border-[rgb(var(--border-color))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] placeholder-[rgb(var(--text-color))]/40 transition-all duration-200"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 font-semibold"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                <span>Opslaan...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-3" />
                <span>Naam Opslaan</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 p-3 bg-[rgb(var(--border-color))]/10 rounded-lg">
          <p className="text-xs text-[rgb(var(--text-color))]/60 text-center">
            💡 <strong>Tip:</strong> Je naam wordt lokaal opgeslagen en alleen gedeeld met mensen die toegang hebben tot jouw lijsten.
          </p>
          <p className="text-xs text-[rgb(var(--text-color))]/60 text-center mt-2">
            ⚠️ <strong>Let op:</strong> Bij het wisselen van browser (bijv. van Firefox naar Chrome) moet je je naam opnieuw instellen.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserNameModal;