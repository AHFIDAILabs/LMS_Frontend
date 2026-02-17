'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export function useRequireAdmin(redirectTo: string = '/auth/login') {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  useEffect(() => {
    if (loading) return; // wait for auth to be ready

    const isProtectedAdmin = pathname?.startsWith('/dashboard/admin');

    if (!isAuthenticated || !isAdmin) {
      if (isProtectedAdmin) {
        router.replace(`${redirectTo}?next=${encodeURIComponent(pathname || '/dashboard/admin')}`);
      }
    }
  }, [loading, isAuthenticated, isAdmin, router, pathname, redirectTo]);

  return {
    isAdmin,
    ready: !loading,
    user,
  };
}