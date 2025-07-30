import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { UnifiedThemeProvider } from './context/UnifiedThemeContext'
import { ToastProvider } from './context/ToastContext'

// Debug wrapper to catch theme initialization errors
function RootErrorBoundary({ children }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '20px', background: '#f8f8f8', fontFamily: 'sans-serif' }}>
        <h1>Application Error</h1>
        <p>Error: {error?.message || 'Unknown error'}</p>
        <pre style={{ background: '#eee', padding: '10px', overflow: 'auto' }}>
          {error?.stack || 'No stack trace available'}
        </pre>
        <button 
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
          }}
          style={{ padding: '10px', margin: '10px' }}
        >
          Clear Storage & Reload
        </button>
      </div>
    );
  }

  return children;
}

// Immediate storage cleanup function
if (typeof window !== 'undefined') {
  // Simple, immediate storage clear
  window.clearAppStorage = () => {
    try {
      console.log('Clearing storage...');
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear specific problematic keys
      const prefixes = [
        'boodschappenlijst_v2_',
        'boodschappenlijst_backup_',
        'boodschappenlijst_session_'
      ];
      
      prefixes.forEach(prefix => {
        // Clear localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith(prefix)) {
            sessionStorage.removeItem(key);
          }
        });
      });
      
      console.log('Storage cleared successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };
  
  // Auto-clear storage if URL contains clear=true parameter
  if (window.location.search.includes('clear=true')) {
    console.log('Auto-clearing storage due to clear=true parameter');
    
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear specific problematic keys
      const prefixes = [
        'boodschappenlijst_v2_',
        'boodschappenlijst_backup_',
        'boodschappenlijst_session_'
      ];
      
      prefixes.forEach(prefix => {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(prefix)) localStorage.removeItem(key);
        });
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith(prefix)) sessionStorage.removeItem(key);
        });
      });
      
      console.log('Storage cleared via auto-clear');
      
      // Remove the clear parameter from URL
      const url = new URL(window.location);
      url.searchParams.delete('clear');
      window.location.href = url.toString();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
  
  // Add manual clear button to page for easy access
  window.addEventListener('DOMContentLoaded', () => {
    // Create a simple clear button if page is stuck
    if (!document.querySelector('#root') || document.querySelector('#root').children.length === 0) {
      const clearButton = document.createElement('button');
      clearButton.textContent = 'Clear Storage & Reload';
      clearButton.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:20px;background:#007bff;color:white;border:none;border-radius:5px;font-size:16px;cursor:pointer;z-index:9999;';
      clearButton.onclick = () => {
        window.clearAppStorage();
      };
      document.body.appendChild(clearButton);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <UnifiedThemeProvider>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </UnifiedThemeProvider>
    </RootErrorBoundary>
  </React.StrictMode>,
)