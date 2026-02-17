import { useState, useEffect, useCallback } from 'react';
import { instructorService } from '../services/instructorService';

interface DashboardStats {
  courses: {
    total: number;
    published: number;
  };
  students: {
    totalEnrollments: number;
    active: number;
  };
  assessments: {
    pendingSubmissions: number;
    gradedThisWeek: number;
  };
  recentActivity: {
    submissions: any[];
  };
}

export const useInstructor = () => {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch instructor profile
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await instructorService.getProfile();
      if (res.success) {
        setProfile(res.data);
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch dashboard stats
const fetchDashboardStats = useCallback(async () => {
  setStatsLoading(true);
  setError(null);
  try {
    const res = await instructorService.getDashboardStats();
    if (res?.success && res?.data) {
      setStats(res.data);
    } else {
      // ✅ Don't set error for missing data — just leave stats null
      // so the page can render with empty states instead of an error banner
      console.warn("Dashboard stats returned no data:", res);
    }
  } catch (err: any) {
    setError(err.message || "Failed to load dashboard stats");
  } finally {
    setStatsLoading(false);
  }
}, []);

  // Create course
  const createCourse = useCallback(async (
    data: FormData | Record<string, any>
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Type guard to check programId exists
      const programId = data instanceof FormData 
        ? data.get('program') || data.get('programId')
        : data.program || data.programId;
      
      if (!programId) {
        throw new Error('Program ID is required to create a course');
      }
      
      const res = await instructorService.createCourse(data);
      
      if (res.success) {
        // Refresh stats after creating course
        await fetchDashboardStats();
        return res.data;
      } else {
        throw new Error(res.error || 'Failed to create course');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardStats]);

  // Initialize on mount
  useEffect(() => {
    fetchProfile();
    fetchDashboardStats();
  }, [fetchProfile, fetchDashboardStats]);

  return {
    profile,
    stats,
    loading,
    statsLoading,
    error,
    createCourse,
    refreshProfile: fetchProfile,
    refreshStats: fetchDashboardStats,
  };
};