import React from 'react';
import { useBackendStatus } from '../hooks/useBackendStatus';

interface BackendStatusIndicatorProps {
  minimal?: boolean;
  className?: string;
}

export const BackendStatusIndicator: React.FC<BackendStatusIndicatorProps> = ({ 
  minimal = false, 
  className = '' 
}) => {
  const { isHealthy, isLoading, isColdStart, error, checkHealth } = useBackendStatus();

  if (minimal) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${
          isLoading ? 'bg-yellow-500 animate-pulse' :
          isHealthy ? 'bg-green-500' : 'bg-red-500'
        }`} />
        {!isHealthy && !isLoading && (
          <button
            onClick={checkHealth}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!isLoading && isHealthy && !isColdStart) {
    return null; // Don't show anything when everything is working normally
  }

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      {isLoading && (
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <div>
            <p className="text-sm font-medium text-gray-900">Connecting to backend...</p>
            <p className="text-xs text-gray-600">This may take up to 2-3 minutes on first load</p>
          </div>
        </div>
      )}
      
      {isColdStart && !isLoading && (
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Backend is warming up</p>
            <p className="text-xs text-gray-600">Initial load may be slower than usual</p>
          </div>
        </div>
      )}
      
      {error && !isLoading && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-xs">×</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Backend connection issue</p>
              <p className="text-xs text-gray-600">{error}</p>
            </div>
          </div>
          <button
            onClick={checkHealth}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
