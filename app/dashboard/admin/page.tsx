import React from 'react';
import { AdminProvider } from '@/lib/context/adminContext';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminPage = () => {
  return (
    <AdminProvider>
      <AdminDashboard />
    </AdminProvider>
  );
};

export default AdminPage;
