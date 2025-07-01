import React, { createContext, useContext, useState } from 'react';

interface AdminRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  lastRefresh: Date | null;
}

const AdminRefreshContext = createContext<AdminRefreshContextType | undefined>(undefined);

interface AdminRefreshProviderProps {
  children: React.ReactNode;
}

export const AdminRefreshProvider: React.FC<AdminRefreshProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    setLastRefresh(new Date());
  };

  return (
    <AdminRefreshContext.Provider 
      value={{ 
        refreshTrigger, 
        triggerRefresh, 
        lastRefresh 
      }}
    >
      {children}
    </AdminRefreshContext.Provider>
  );
};

export const useAdminRefresh = () => {
  const context = useContext(AdminRefreshContext);
  if (context === undefined) {
    throw new Error('useAdminRefresh must be used within an AdminRefreshProvider');
  }
  return context;
};
