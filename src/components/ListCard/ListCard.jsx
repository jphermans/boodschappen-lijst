import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Check, Share2, Users, Trash2 } from 'lucide-react';
import { canDeleteList } from '../../firebase';
import { ShoppingListType, EventHandlerType } from '../../types';
import { usePerformanceMonitoring } from '../../utils/performanceMonitor';

/**
 * ListCard component - Extracted from App.jsx
 * Renders a single shopping list card with all its actions and information
 */
const ListCard = React.memo(({
  list,
  onOpenList,
  onShare,
  onUserManagement,
  onDelete
}) => {
  const { measureRender } = usePerformanceMonitoring('ListCard');

  // Memoized event handlers to prevent unnecessary re-renders
  const handleCardClick = useCallback(() => {
    onOpenList(list);
  }, [onOpenList, list]);

  const handleShare = useCallback((e) => {
    e.stopPropagation();
    onShare(list.id);
  }, [onShare, list.id]);

  const handleUserManagement = useCallback((e) => {
    e.stopPropagation();
    onUserManagement(list.id);
  }, [onUserManagement, list.id]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(list.id);
  }, [onDelete, list.id]);

  const handleOpenList = useCallback((e) => {
    e.stopPropagation();
    onOpenList(list);
  }, [onOpenList, list]);

  // Memoized calculations to avoid recalculating on every render
  const { completedItems, totalItems, progressPercentage } = useMemo(() => {
    const completed = list.items?.filter(item => item.completed).length || 0;
    const total = list.items?.length || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      completedItems: completed,
      totalItems: total,
      progressPercentage: percentage
    };
  }, [list.items]);

  // Memoized timestamp formatting
  const formattedTimestamp = useMemo(() => {
    if (!list.updatedAt) return '';
    
    const date = list.updatedAt.toDate ? list.updatedAt.toDate() : new Date(list.updatedAt);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Zojuist';
    if (diffHours < 24 && diffDays === 0) return `${diffHours}u geleden`;
    if (diffDays === 1) return 'Gisteren';
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  }, [list.updatedAt]);

  // Memoized status badge classes
  const statusBadgeClasses = useMemo(() => {
    return `px-3 py-1.5 text-xs font-semibold rounded-full inline-block ${
      list.isCreator
        ? 'bg-[rgb(var(--primary-color))]/20 text-[rgb(var(--primary-color))] border border-[rgb(var(--primary-color))]/20'
        : 'bg-[rgb(var(--secondary-color))]/20 text-[rgb(var(--secondary-color))] border border-[rgb(var(--secondary-color))]/20'
    }`;
  }, [list.isCreator]);

  // Memoized permission checks
  const canDelete = useMemo(() => canDeleteList(list), [list]);

  return measureRender(() => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bg-[rgb(var(--card-bg))] rounded-xl md:rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-4 md:p-6 lg:p-6 xl:p-8 hover:shadow-2xl hover:border-[rgb(var(--border-color))]/40 transition-all duration-300 cursor-pointer relative overflow-visible"
      onClick={handleCardClick}
    >
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header - Completely restructured for full visibility */}
        <div className="mb-4 lg:mb-6">
          {/* Title */}
          <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-[rgb(var(--card-text))] mb-2 md:mb-3 group-hover:text-primary transition-colors duration-200 break-words leading-tight ipad-simple-fix">
            {list.name}
          </h3>
          
          {/* Stats and info row */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-[rgb(var(--text-color))]/60 mb-2 md:mb-3">
            <span className="whitespace-nowrap">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
            {list.sharedWith && list.sharedWith.length > 0 && (
              <span className="flex items-center whitespace-nowrap">
                <Users className="w-3 h-3 mr-1" />
                {list.sharedWith.length} gedeeld
              </span>
            )}
          </div>
          
          {/* Creator info */}
          {list.creatorName && (
            <div className="text-xs text-[rgb(var(--text-color))]/50 mb-2 md:mb-3 break-words ipad-simple-fix">
              Gemaakt door {list.creatorName}
            </div>
          )}
          
          {/* Status and timestamp - full width row */}
          <div className="flex items-center justify-between gap-2 md:gap-3 mb-2">
            <span className={statusBadgeClasses}>
              {list.isCreator ? 'Eigenaar' : 'Gedeeld'}
            </span>
            {list.updatedAt && (
              <span className="text-xs text-[rgb(var(--text-color))]/40 whitespace-nowrap">
                {formattedTimestamp}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar for Items */}
        {totalItems > 0 && (
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[rgb(var(--text-color))]/60">Voortgang</span>
              <span className="text-xs font-medium text-[rgb(var(--card-text))]">
                {progressPercentage}%
              </span>
            </div>
            <div className="progress-bar-container h-2">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.max(0, Math.min(100, progressPercentage))}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons - Mobile Optimized */}
        <div className="space-y-2 md:space-y-3">
          {/* Primary Action */}
          <button
            onClick={handleOpenList}
            className="w-full flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 lg:py-3 xl:py-4 bg-[rgb(var(--color-primary-button))] hover:opacity-90 text-white rounded-lg md:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform active:scale-95 sm:hover:scale-105 transition-all duration-200 font-semibold text-xs md:text-sm lg:text-base xl:text-lg touch-manipulation"
          >
            <Check className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 mr-2 md:mr-3" />
            <span>Lijst Openen</span>
          </button>
          
          {/* Share Button - Full Width */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 lg:py-3 xl:py-4 bg-[rgb(var(--color-secondary-button))] hover:opacity-90 text-white rounded-lg md:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transform active:scale-95 sm:hover:scale-105 transition-all duration-200 font-semibold text-xs md:text-sm lg:text-base xl:text-lg touch-manipulation"
            title="Delen"
          >
            <Share2 className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 mr-2 md:mr-3" />
            <span>Delen</span>
          </button>
          
          {/* Other Actions */}
          {(list.isCreator || canDelete) && (
            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              {list.isCreator && (
                <button
                  onClick={handleUserManagement}
                  className="flex-1 flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 lg:py-3 bg-[rgb(var(--color-info-button))] hover:opacity-90 text-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transform active:scale-95 sm:hover:scale-105 transition-all duration-200 font-medium text-xs md:text-sm lg:text-base touch-manipulation"
                  title="Gebruikers beheren"
                >
                  <Users className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 mr-1 md:mr-2" />
                  <span>Gebruikers</span>
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center px-3 md:px-4 py-2 md:py-2.5 lg:py-3 bg-[rgb(var(--color-error-button))] hover:opacity-90 text-white rounded-lg lg:rounded-xl shadow-md hover:shadow-lg transform active:scale-95 sm:hover:scale-105 transition-all duration-200 font-medium text-xs md:text-sm lg:text-base touch-manipulation"
                  title="Verwijderen"
                >
                  <Trash2 className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 mr-1 md:mr-2" />
                  <span>Verwijderen</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  ));
});

// Display name for debugging
ListCard.displayName = 'ListCard';

// PropTypes for ListCard component
ListCard.propTypes = {
  list: ShoppingListType.isRequired,
  onOpenList: EventHandlerType.isRequired,
  onShare: EventHandlerType.isRequired,
  onUserManagement: EventHandlerType.isRequired,
  onDelete: EventHandlerType.isRequired
};

export default ListCard;