
// services/adminService.ts
import { fetchWithAuth, handleResponse } from '../lib/utils'; // assuming you move your helper functions to a utils file
import {GetAllUsersResponse} from '@/types';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

export const adminService = {


  // ============================
  // ADMIN  CREATE PROGRAM
// ============================

  // =============================
  // USER MANAGEMENT (Admin Only)
  // =============================
  getAllUsers: async (params?: Record<string, string | number>) => {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    const response = await fetchWithAuth(`${API_URL}/admin/users${query}`);
    return handleResponse<GetAllUsersResponse>(response);
  },

  getUserById: async (userId: string) => {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}`);
    return handleResponse(response);
  },

  updateUser: async (userId: string, data: any) => {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId: string) => {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  updateUserStatus: async (userId: string, status: string) => {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return handleResponse(response);
  },

  // =============================
  // STUDENT MANAGEMENT
  // =============================
  getAllStudents: async () => {
    const response = await fetchWithAuth(`${API_URL}/admin/students`);
    return handleResponse(response);
  },

  getStudentProgress: async (studentId: string) => {
    const response = await fetchWithAuth(`${API_URL}/admin/students/${studentId}/progress`);
    return handleResponse(response);
  },

  // =============================
  // INSTRUCTOR MANAGEMENT
  // =============================
  getAllInstructors: async () => {
    const response = await fetchWithAuth(`${API_URL}/admin/instructors`);
    return handleResponse(response);
  },

promoteToInstructor: async (userId: string, programId?: string) => {
  const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}/promote-instructor`, {
    method: 'PATCH',
    body: JSON.stringify({ programId }),
  });
  return handleResponse(response);
},

  demoteToStudent: async (userId: string) => {
    const response = await fetchWithAuth(`${API_URL}/admin/users/${userId}/demote-instructor`, {
      method: 'PATCH',
    });
    return handleResponse(response);
  },

  // =============================
  // DASHBOARD
  // =============================
  getDashboardStats: async () => {
    const response = await fetchWithAuth(`${API_URL}/admin/dashboard/stats`);
    return handleResponse(response);
  },

  // =============================
  // BULK OPERATIONS
  // =============================
  bulkEnrollStudents: async (data: any) => {
    const response = await fetchWithAuth(`${API_URL}/admin/bulk/enroll`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  bulkUpdateStatus: async (data: any) => {
    const response = await fetchWithAuth(`${API_URL}/admin/bulk/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // =============================
  // REPORTS
  // =============================
  getUserActivityReport: async () => {
    const response = await fetchWithAuth(`${API_URL}/admin/reports/user-activity`);
    return handleResponse(response);
  },

  getCourseCompletionReport: async () => {
    const response = await fetchWithAuth(`${API_URL}/admin/reports/course-completion`);
    return handleResponse(response);
  },
};
