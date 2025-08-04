import React from 'react';
import PropTypes from 'prop-types';
import errorHandler from '../../utils/errorHandler';
import { ChildrenType } from '../../types';

/**
 * React Error Boundary component for catching JavaScript errors anywhere in the component tree
 * Provides user-friendly error UI with retry mechanisms and development mode error details
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error using our centralized error handler
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to our error handling system
    errorHandler.logError(error, 'react_error_boundary', {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.fallbackComponent || 'default',
      retryCount: this.state.retryCount
    });
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    try {
      // Wait a moment before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false
      });
    } catch (retryError) {
      console.error('Error during retry:', retryError);
      this.setState({ isRetrying: false });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI can be provided via props
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg 
                  className="h-6 w-6 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>

              {/* Error Title */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Er ging iets mis
              </h3>

              {/* Error Message */}
              <p className="text-sm text-gray-500 mb-6">
                {this.props.message || 'De applicatie heeft een onverwachte fout ondervonden. Probeer het opnieuw of herlaad de pagina.'}
              </p>

              {/* Development Mode Error Details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Technische details (ontwikkeling)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  {this.state.isRetrying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Opnieuw proberen...
                    </>
                  ) : (
                    'Opnieuw proberen'
                  )}
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Pagina herladen
                </button>
              </div>

              {/* Retry Count Info */}
              {this.state.retryCount > 0 && (
                <p className="mt-3 text-xs text-gray-400">
                  Pogingen: {this.state.retryCount}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// PropTypes for ErrorBoundary component
ErrorBoundary.propTypes = {
  children: ChildrenType.isRequired,
  fallback: PropTypes.func,
  fallbackComponent: PropTypes.string,
  message: PropTypes.string
};

export default ErrorBoundary;