/**
 * Lazy-loaded components for code splitting
 * This file centralizes all lazy imports and loading components
 */

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';

// Loading component for lazy-loaded routes
const PageLoadingSpinner = ({ message = "Pagina laden..." }) => (
  <div className="min-h-screen-safe flex items-center justify-center bg-[rgb(var(--bg-color))] safe-area-all">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-[rgb(var(--text-color))]/80">
        {message}
      </p>
    </div>
  </div>
);

// Loading component for smaller components
const ComponentLoadingSpinner = ({ message = "Laden..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <p className="text-[rgb(var(--text-color))]/60 text-sm">
        {message}
      </p>
    </div>
  </div>
);

// Lazy-loaded page components
export const LazySettingsPage = React.lazy(() => 
  import('../pages/Settings').then(module => ({
    default: module.default
  }))
);

export const LazyAnalyticsPage = React.lazy(() => 
  import('../pages/Analytics').then(module => ({
    default: module.default
  }))
);

export const LazyThemePage = React.lazy(() => 
  import('../pages/ThemePage').then(module => ({
    default: module.default
  }))
);

export const LazyPersistencePage = React.lazy(() => 
  import('../pages/Persistence').then(module => ({
    default: module.default
  }))
);

export const LazyShoppingListPage = React.lazy(() => 
  import('../pages/ShoppingListPage').then(module => ({
    default: module.default
  }))
);

// Lazy-loaded modal components (heavy components)
export const LazyQRShareModal = React.lazy(() => 
  import('../components/QRShareModal').then(module => ({
    default: module.default
  }))
);

export const LazyQRScannerModal = React.lazy(() => 
  import('../components/QRScannerModal').then(module => ({
    default: module.default
  }))
);

export const LazyUserManagementModal = React.lazy(() => 
  import('../components/UserManagementModal').then(module => ({
    default: module.default
  }))
);

// Lazy-loaded utility components
export const LazyVoiceInput = React.lazy(() => 
  import('../components/VoiceInput').then(module => ({
    default: module.default
  }))
);

// Higher-order component for wrapping lazy components with Suspense
export const withLazyLoading = (LazyComponent, fallback = <PageLoadingSpinner />) => {
  return React.forwardRef((props, ref) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

// Higher-order component for modal lazy loading
export const withModalLazyLoading = (LazyComponent) => {
  return React.forwardRef((props, ref) => (
    <Suspense fallback={<ComponentLoadingSpinner message="Modal laden..." />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

// Preloader utility for critical routes
export const preloadComponent = (importFunction) => {
  const componentImport = importFunction();
  return componentImport;
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  preloadComponent(() => import('../pages/Settings'));
  preloadComponent(() => import('../components/QRScannerModal'));
};

// Route-specific loading messages
export const routeLoadingMessages = {
  settings: "Instellingen laden...",
  analytics: "Analytics laden...",
  theme: "Thema pagina laden...",
  persistence: "Data beheer laden...",
  list: "Lijst laden...",
  qrShare: "QR delen laden...",
  qrScanner: "QR scanner laden...",
  userManagement: "Gebruikersbeheer laden..."
};

// Create wrapped components with appropriate loading messages
export const SettingsPage = withLazyLoading(
  LazySettingsPage, 
  <PageLoadingSpinner message={routeLoadingMessages.settings} />
);

export const AnalyticsPage = withLazyLoading(
  LazyAnalyticsPage, 
  <PageLoadingSpinner message={routeLoadingMessages.analytics} />
);

export const ThemePage = withLazyLoading(
  LazyThemePage, 
  <PageLoadingSpinner message={routeLoadingMessages.theme} />
);

export const PersistencePage = withLazyLoading(
  LazyPersistencePage, 
  <PageLoadingSpinner message={routeLoadingMessages.persistence} />
);

export const ShoppingListPage = withLazyLoading(
  LazyShoppingListPage, 
  <PageLoadingSpinner message={routeLoadingMessages.list} />
);

export const QRShareModal = withModalLazyLoading(LazyQRShareModal);
export const QRScannerModal = withModalLazyLoading(LazyQRScannerModal);
export const UserManagementModal = withModalLazyLoading(LazyUserManagementModal);

export default {
  SettingsPage,
  AnalyticsPage,
  ThemePage,
  PersistencePage,
  ShoppingListPage,
  QRShareModal,
  QRScannerModal,
  UserManagementModal,
  preloadCriticalComponents
};