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

// Add global storage cleanup function
if (typeof window !== 'undefined') {
  window.clearAppStorage = () => {
    persistentStorage.clearCorruptedData().then(() => {
      console.log('Storage cleared successfully');
      window.location.reload();
    });
  };
  
  // Auto-clear storage if URL contains clear=true parameter
  if (window.location.search.includes('clear=true')) {
    console.log('Auto-clearing storage due to clear=true parameter');
    persistentStorage.clearCorruptedData().then(() => {
      // Remove the clear parameter from URL
      const url = new URL(window.location);
      url.searchParams.delete('clear');
      window.location.href = url.toString();
    });
  }
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