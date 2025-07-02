import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export interface BackendStatus {
  isHealthy: boolean;
  isLoading: boolean;
  isColdStart: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export const useBackendStatus = () => {
  const [status, setStatus] = useState<BackendStatus>({
    isHealthy: false,
    isLoading: true,
    isColdStart: false,
    lastChecked: null,
    error: null,
  });

  const checkBackendHealth = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const startTime = Date.now();
      const isHealthy = await apiService.healthCheck();
      const responseTime = Date.now() - startTime;
      
      // If response took more than 10 seconds, it's likely a cold start
      const isColdStart = responseTime > 10000;
      
      setStatus({
        isHealthy,
        isLoading: false,
        isColdStart,
        lastChecked: new Date(),
        error: null,
      });
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        isHealthy: false,
        error: error.message || 'Backend health check failed',
        lastChecked: new Date(),
      }));
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkBackendHealth();
    
    // Set up periodic health checks (every 5 minutes)
    const interval = setInterval(checkBackendHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    checkHealth: checkBackendHealth,
  };
};
