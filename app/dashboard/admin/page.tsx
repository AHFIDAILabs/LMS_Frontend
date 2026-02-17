'use client';

import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useRequireAdmin } from '@/hooks/admin/useAdmin';

const AdminPage = () => {
  const { ready, isAdmin } = useRequireAdmin('/auth/login');

  // Wait for auth to initialize to avoid flicker
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Checking permissions…
      </div>
    );
  }

  if (!isAdmin) {
    // useRequireAdmin already redirects; render null to prevent flash
    return null;
  }

  return <AdminDashboard />;
};

export default AdminPage;