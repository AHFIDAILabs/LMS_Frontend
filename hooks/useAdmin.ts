// hooks/useAdmin.ts
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { User } from '@/types/user';

// =============================
// TYPES
// =============================

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  activeUsers: number;
  [key: string]: any;
}

interface StudentProgress {
  studentId: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  averageProgress: number;
  [key: string]: any;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// =============================
// DASHBOARD STATS
// =============================
export const useDashboardStats = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDashboardStats() as ApiResponse<DashboardStats>;
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch dashboard stats');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

// =============================
// USER MANAGEMENT
// =============================
export const useUsers = (params?: Record<string, string | number>) => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getAllUsers(params) as ApiResponse<{
        users: User[];
        pagination?: any;
      }>;
      
      if (response.success && response.data) {
        setData(response.data.users || []);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, loading, error, pagination, refetch: fetchUsers };
};

export const useUser = (userId: string) => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getUserById(userId) as ApiResponse<User>;
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { data, loading, error, refetch: fetchUser };
};

export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(async (userId: string, data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.updateUser(userId, data) as ApiResponse<User>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateUser, loading, error };
};

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.deleteUser(userId) as ApiResponse<any>;
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete user');
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteUser, loading, error };
};

export const useUpdateUserStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (userId: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.updateUserStatus(userId, status) as ApiResponse<User>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update user status');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStatus, loading, error };
};

export const useUpdateUserRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRole = useCallback(async (userId: string, role: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.updateUserRole(userId, role) as ApiResponse<User>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update user role');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateRole, loading, error };
};

// =============================
// STUDENT MANAGEMENT
// =============================
export const useStudents = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getAllStudents() as ApiResponse<User[]>;
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch students');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { data, loading, error, refetch: fetchStudents };
};

export const useStudentProgress = (studentId: string) => {
  const [data, setData] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getStudentProgress(studentId) as ApiResponse<StudentProgress>;
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch student progress');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { data, loading, error, refetch: fetchProgress };
};

// =============================
// INSTRUCTOR MANAGEMENT
// =============================
export const useInstructors = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getAllInstructors() as ApiResponse<User[]>;
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch instructors');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  return { data, loading, error, refetch: fetchInstructors };
};

export const usePromoteToInstructor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promote = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.promoteToInstructor(userId) as ApiResponse<User>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to promote user to instructor');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { promote, loading, error };
};

export const useDemoteToStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demote = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.demoteToStudent(userId) as ApiResponse<User>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to demote instructor to student');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { demote, loading, error };
};

// =============================
// BULK OPERATIONS
// =============================
export const useBulkEnroll = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkEnroll = useCallback(async (data: {
    studentIds: string[];
    courseId: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.bulkEnrollStudents(data) as ApiResponse<any>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to bulk enroll students');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { bulkEnroll, loading, error };
};

export const useBulkUpdateStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkUpdateStatus = useCallback(async (data: {
    userIds: string[];
    status: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.bulkUpdateStatus(data) as ApiResponse<any>;
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to bulk update status');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { bulkUpdateStatus, loading, error };
};

// =============================
// REPORTS
// =============================
export const useUserActivityReport = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getUserActivityReport() as ApiResponse<any>;
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch user activity report');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchReport };
};

export const useCourseCompletionReport = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getCourseCompletionReport() as ApiResponse<any>;
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch course completion report');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchReport };
};