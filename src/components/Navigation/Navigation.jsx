import React from 'react';
import PropTypes from 'prop-types';
import { Settings, List, QrCode, BarChart3, Palette, Database, Activity } from 'lucide-react';
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
  onOpenPerformanceDashboard,
  theme,
  listsCount
}) => {
  // Check if dev mode is enabled
  const isDevMode = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('dev') === 'true';
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
    <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
      {/* Desktop Navigation - Compact horizontal layout */}
      <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
        {/* Main navigation buttons - compact */}
        {navigationItems.slice(0, 3).map(({ id, label, icon: Icon, onClick }) => (
          <button
            key={id}
            onClick={onClick}
            className={`px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 ${
              currentPage === id || (!currentPage && id === 'overview')
                ? 'bg-[rgb(var(--primary-color))] text-white shadow-md'
                : 'text-[rgb(var(--text-color))]/70 hover:bg-[rgb(var(--border-color))]/20 hover:text-[rgb(var(--card-text))]'
            }`}
            title={label}
          >
            <Icon className="w-3 h-3 xl:w-4 xl:h-4" />
          </button>
        ))}
        
        {/* Dropdown for additional navigation items */}
        <div className="relative group">
          <button className="px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium text-[rgb(var(--text-color))]/70 hover:bg-[rgb(var(--border-color))]/20 hover:text-[rgb(var(--card-text))] transition-all duration-200">
            •••
          </button>
          <div className="absolute right-0 top-full mt-1 bg-[rgb(var(--card-bg))] border border-[rgb(var(--border-color))]/20 rounded-lg shadow-lg py-1 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {navigationItems.slice(3).map(({ id, label, icon: Icon, onClick }) => (
              <button
                key={id}
                onClick={onClick}
                className="w-full flex items-center px-3 py-2 text-sm text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/20 hover:text-[rgb(var(--card-text))] transition-all duration-200"
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Separator */}
        <div className="w-px h-6 bg-[rgb(var(--border-color))]/30 mx-2"></div>
        
        {/* Lists count */}
        <div className="flex items-center space-x-1">
          <span className="text-xs xl:text-sm text-[rgb(var(--text-color))]/60 font-medium">
            {listsCount}
          </span>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Action buttons - both mobile and desktop */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Performance Dashboard - Only visible in dev mode */}
        {isDevMode && onOpenPerformanceDashboard && (
          <button
            onClick={onOpenPerformanceDashboard}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform active:scale-95 lg:hover:scale-105 transition-all duration-200"
            aria-label="Performance Dashboard"
            title="Performance Dashboard (Dev Mode)"
          >
            <Activity className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
          </button>
        )}
        
        {/* QR Scanner */}
        <button
          onClick={onOpenScanner}
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-[rgb(var(--color-secondary-button))] hover:opacity-90 text-white shadow-md hover:shadow-lg transform active:scale-95 lg:hover:scale-105 transition-all duration-200"
          aria-label="QR-code scannen"
          title="QR Scanner"
        >
          <QrCode className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        </button>
        
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-[rgb(var(--color-primary-button))] hover:opacity-90 text-white shadow-md hover:shadow-lg transform active:scale-95 lg:hover:scale-105 transition-all duration-200 group"
          aria-label="Thema wisselen"
          title="Thema wisselen"
        >
          <span className="text-sm sm:text-base lg:text-lg group-hover:scale-110 transition-transform duration-200">
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
        </button>
        
        {/* Settings */}
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-[rgb(var(--border-color))]/60 hover:bg-[rgb(var(--border-color))]/80 text-[rgb(var(--card-text))] shadow-md hover:shadow-lg transform active:scale-95 lg:hover:scale-105 transition-all duration-200 group"
          aria-label="Instellingen"
          title="Instellingen"
        >
          <Settings className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

// PropTypes for Navigation component
Navigation.propTypes = {
  currentPage: PropTypes.string,
  onNavigate: EventHandlerType.isRequired,
  onToggleTheme: EventHandlerType.isRequired,
  onOpenScanner: EventHandlerType.isRequired,
  onOpenPerformanceDashboard: PropTypes.func,
  theme: createEnumValidator(['light', 'dark']).isRequired,
  listsCount: PropTypes.number.isRequired
};

export default Navigation;