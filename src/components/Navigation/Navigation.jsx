import React from 'react';
import PropTypes from 'prop-types';
import { Settings, List, QrCode, BarChart3, Palette, Database } from 'lucide-react';
import { EventHandlerType, createEnumValidator } from '../../types';

/**
 * Navigation component - Extracted from App.jsx
 * Handles both desktop and mobile navigation
 */
const Navigation = ({ 
  currentPage, 
  onNavigate, 
  onToggleTheme, 
  onOpenScanner, 
  theme, 
  listsCount 
}) => {
  const navigationItems = [
    {
      id: 'overview',
      label: 'Overzicht',
      icon: List,
      onClick: () => onNavigate('overview')
    },
    {
      id: 'settings',
      label: 'Instellingen',
      icon: Settings,
      onClick: () => onNavigate('settings')
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      onClick: () => onNavigate('analytics')
    },
    {
      id: 'theme',
      label: 'Thema',
      icon: Palette,
      onClick: () => onNavigate('theme')
    },
    {
      id: 'persistence',
      label: 'Persistentie',
      icon: Database,
      onClick: () => onNavigate('persistence')
    }
  ];

  const getButtonClasses = (pageId) => {
    const isActive = currentPage === pageId || (!currentPage && pageId === 'overview');
    return `px-4 xl:px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
      isActive
        ? 'bg-[rgb(var(--primary-color))] text-white shadow-lg'
        : 'text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/20 hover:text-[rgb(var(--card-text))]'
    }`;
  };

  return (
    <>
      {/* Desktop Navigation Menu */}
      <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4">
        {navigationItems.map(({ id, label, icon: Icon, onClick }) => (
          <button
            key={id}
            onClick={onClick}
            className={getButtonClasses(id)}
          >
            <Icon className="w-4 h-4 inline mr-2" />
            {label}
          </button>
        ))}
        
        <button
          onClick={onOpenScanner}
          className="px-4 xl:px-6 py-2.5 rounded-xl font-medium text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/20 hover:text-[rgb(var(--card-text))] transition-all duration-200"
        >
          <QrCode className="w-4 h-4 inline mr-2" />
          QR Scanner
        </button>
        
        <div className="w-px h-8 bg-[rgb(var(--border-color))]/30"></div>
        
        <div className="flex items-center space-x-1 xl:space-x-2">
          <span className="text-sm text-[rgb(var(--text-color))]/60 font-medium">
            {listsCount} lijst{listsCount !== 1 ? 'en' : ''}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </nav>

      {/* Mobile Action Buttons */}
      <div className="flex items-center space-x-2 sm:space-x-2 lg:space-x-3 flex-shrink-0 pr-2 sm:pr-0 lg:hidden">
        {/* Mobile QR Scanner */}
        <button
          onClick={onOpenScanner}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[rgb(var(--color-secondary-button))] hover:opacity-90 text-white shadow-md hover:shadow-lg transform active:scale-95 transition-all duration-200"
          aria-label="QR-code scannen"
        >
          <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[rgb(var(--color-primary-button))] hover:opacity-90 text-white shadow-md hover:shadow-lg transform active:scale-95 sm:hover:scale-105 transition-all duration-200 group"
          aria-label="Thema wisselen"
        >
          <span className="text-sm sm:text-base group-hover:scale-110 transition-transform duration-200">
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
        </button>
        
        {/* Settings */}
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[rgb(var(--border-color))]/60 hover:bg-[rgb(var(--border-color))]/80 text-[rgb(var(--card-text))] shadow-md hover:shadow-lg transform active:scale-95 sm:hover:scale-105 transition-all duration-200 group"
          aria-label="Instellingen"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Desktop Action Buttons */}
      <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center w-12 h-12 rounded-lg bg-[rgb(var(--color-primary-button))] hover:opacity-90 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 group"
          aria-label="Thema wisselen"
        >
          <span className="text-xl group-hover:scale-110 transition-transform duration-200">
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
        </button>
        
        {/* Settings */}
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center justify-center w-12 h-12 rounded-lg bg-[rgb(var(--border-color))]/60 hover:bg-[rgb(var(--border-color))]/80 text-[rgb(var(--card-text))] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 group"
          aria-label="Instellingen"
        >
          <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </>
  );
};

// PropTypes for Navigation component
Navigation.propTypes = {
  currentPage: PropTypes.string,
  onNavigate: EventHandlerType.isRequired,
  onToggleTheme: EventHandlerType.isRequired,
  onOpenScanner: EventHandlerType.isRequired,
  theme: createEnumValidator(['light', 'dark']).isRequired,
  listsCount: PropTypes.number.isRequired
};

export default Navigation;