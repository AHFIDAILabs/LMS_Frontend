'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/lib/context/AuthContext';
import type { User } from '@/types';

type UsersListEnvelope = {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: User[];
};

export function useUsers(params?: Record<string, string | number>) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState<{ count: number; total: number; page: number; pages: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== 'admin') {
      setData([]);
      setPagination(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAllUsers(params) as UsersListEnvelope;

      if (res?.success) {
        setData(res.data || []);
        setPagination({ count: res.count, total: res.total, page: res.page, pages: res.pages });
      } else {
        setError('Failed to fetch users');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user, params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, pagination, loading: loading || authLoading, error, refetch: fetchUsers };
}