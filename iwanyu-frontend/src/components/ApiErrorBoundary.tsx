import React, { useState, useEffect } from 'react';

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface ErrorInfo {
  error: Error | null;
  retryCount: number;
  lastRetry: Date | null;
}

const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  const isTimeoutError = error.message.includes('timeout') || error.message.includes('cold start');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-4">
            {isTimeoutError ? (
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isTimeoutError ? 'Backend Starting Up' : 'Connection Error'}
          </h3>
          
          <p className="text-gray-600 mb-4 text-sm">
            {isTimeoutError 
              ? 'The backend is warming up after being idle. This usually takes 2-3 minutes on the first load.'
              : error.message || 'Unable to connect to the backend service.'
            }
          </p>
          
          <button
            onClick={retry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isTimeoutError ? 'Check Again' : 'Retry Connection'}
          </button>
          
          {isTimeoutError && (
            <p className="text-xs text-gray-500 mt-3">
              This happens when the backend has been idle. Subsequent loads will be much faster.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({ 
  children, 
  fallback: Fallback = DefaultErrorFallback 
}) => {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo>({
    error: null,
    retryCount: 0,
    lastRetry: null,
  });

  const handleRetry = () => {
    setErrorInfo(prev => ({
      error: null,
      retryCount: prev.retryCount + 1,
      lastRetry: new Date(),
    }));
  };

  // Listen for unhandled promise rejections (API errors)
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      // Only handle API-related errors
      if (error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('cold start') ||
        error.message.includes('Backend') ||
        error.message.includes('Network Error')
      )) {
        setErrorInfo(prev => ({
          ...prev,
          error,
        }));
        event.preventDefault(); // Prevent the default error handling
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (errorInfo.error) {
    return <Fallback error={errorInfo.error} retry={handleRetry} />;
  }

  return <>{children}</>;
};
