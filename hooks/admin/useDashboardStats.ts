'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/lib/context/AuthContext';

type DashboardEnvelope = {
  success: boolean;
  data?: {
    users: { total: number; students: number; instructors: number; active: number; graduated: number };
    courses: { total: number; published: number };
    enrollments: { total: number; active: number; completed: number };
    certificates: { total: number; issued: number };
    recentActivity: {
      users: Array<any>;
      enrollments: Array<any>;
    };
  };
  message?: string;
  error?: string;
};

export function useDashboardStats() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardEnvelope['data'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== 'admin') {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await adminService.getDashboardStats() as DashboardEnvelope;
      if (res?.success && res?.data) {
        setData(res.data);
      } else {
        setError(res?.error || res?.message || 'Failed to fetch stats');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading: loading || authLoading, error, refetch: fetchStats };
}