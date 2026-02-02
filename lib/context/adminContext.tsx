'use client';
import { createContext, useContext, ReactNode } from 'react';
import { useDashboardStats, useUsers } from '../../hooks/useAdmin';

interface AdminContextType {
  dashboardStats: ReturnType<typeof useDashboardStats>;
  users: ReturnType<typeof useUsers>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  // ✅ Use hooks
  const dashboardStats = useDashboardStats();
  const users = useUsers(); // This now returns { data, loading, error, pagination, refetch }

  return (
    <AdminContext.Provider value={{ dashboardStats, users }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdminContext must be used within AdminProvider');
  return context;
};
