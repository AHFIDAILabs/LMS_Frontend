// services/adminService.ts
import { axiosClient } from '@/lib/axiosClient';
import { extractError } from '../lib/utils';
import { GetAllUsersResponse } from '@/types';

const API_PREFIX = '/admin';

export const adminService = {
  // =============================
  // USER MANAGEMENT (Admin Only)
  // =============================
  getAllUsers: async (params?: Record<string, string | number>) => {
    try {
      const res = await axiosClient.get<GetAllUsersResponse>(`${API_PREFIX}/users`, { params });
      return res.data; // { success, count, total, page, pages, data: User[] }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  getUserById: async (userId: string) => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/users/${userId}`);
      return res.data; // { success, data: { user, enrollments, progress, certificates } }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  updateUser: async (userId: string, data: any) => {
    try {
      const res = await axiosClient.put(`${API_PREFIX}/users/${userId}`, data);
      return res.data; // { success, message, data: user }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const res = await axiosClient.delete(`${API_PREFIX}/users/${userId}`);
      return res.data; // { success, message }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  updateUserStatus: async (userId: string, status: string) => {
    try {
      const res = await axiosClient.patch(`${API_PREFIX}/users/${userId}/status`, { status });
      return res.data; // { success, message, data: user }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  updateUserRole: async (userId: string, role: string) => {
    try {
      const res = await axiosClient.patch(`${API_PREFIX}/users/${userId}/role`, { role });
      return res.data; // { success, message, data: user }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  // =============================
  // STUDENT MANAGEMENT
  // =============================
  getAllStudents: async (params?: Record<string, string | number>) => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/students`, { params });
      return res.data; // { success, count, total, page, pages, data: User[] }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  getStudentProgress: async (studentId: string) => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/students/${studentId}/progress`);
      return res.data; // { success, data: { student, progress, enrollments } }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  // =============================
  // INSTRUCTOR MANAGEMENT
  // =============================
  getAllInstructors: async () => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/instructors`);
      return res.data; // { success, count, data: User[] }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  promoteToInstructor: async (userId: string, programId?: string) => {
    try {
      const res = await axiosClient.patch(`${API_PREFIX}/users/${userId}/promote-instructor`, { programId });
      return res.data; // { success, data: user }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  demoteToStudent: async (userId: string) => {
    try {
      const res = await axiosClient.patch(`${API_PREFIX}/users/${userId}/demote-instructor`);
      return res.data; // { success, data: user }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  // =============================
  // DASHBOARD
  // =============================
  getDashboardStats: async () => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/dashboard/stats`);
      return res.data; // { success, data: { users, courses, enrollments, certificates, recentActivity } }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  // =============================
  // COURSES (Admin detail + public)
  // =============================
  getCourseById: async (courseId: string) => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/courses/${courseId}`);
      return res.data; // { success, data: { ...course, modules, stats } }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  getCourseByIdPublic: async (courseId: string) => {
    try {
      const res = await axiosClient.get(`/courses/${courseId}`);
      return res.data; // { success, data: { course, modules, stats } } (from public)
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  // =============================
  // BULK OPERATIONS
  // =============================
  bulkEnrollStudents: async (studentIds: string[], programId: string, cohort?: string) => {
    try {
      const res = await axiosClient.post(`${API_PREFIX}/bulk/enroll`, {
        studentIds,
        programId,
        cohort,
      });
      return res.data; // { success, message, data: { enrolled, failed, enrollments, errors } }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  bulkUpdateStatus: async (data: { userIds: string[]; status: string }) => {
    try {
      const res = await axiosClient.patch(`${API_PREFIX}/bulk/status`, data);
      return res.data; // { success, message, data: { matched, modified } }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  // =============================
  // REPORTS
  // =============================
  getUserActivityReport: async (params?: Record<string, string>) => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/reports/user-activity`, { params });
      return res.data; // { success, count, data: users[] }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  getCourseCompletionReport: async (params?: { courseId?: string }) => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/reports/course-completion`, { params });
      return res.data; // { success, count, data: completionData[] }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  // =============================
  // PROGRAMS (Admin)
  // =============================
  createProgram: async (payload: any) => {
    try {
      const res = await axiosClient.post(`${API_PREFIX}/programs`, payload);
      return res.data; // { success, message, data: program }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  getAllPrograms: async (params?: Record<string, string | number>) => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/programs`, { params });
      return res.data; // { success, count, total, page, pages, data: programs[] }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  getProgramById: async (id: string) => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/programs/${id}`);
      return res.data; // { success, data: { program, courses } }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  updateProgram: async (id: string, payload: any) => {
    try {
      const res = await axiosClient.put(`${API_PREFIX}/programs/${id}`, payload);
      return res.data; // { success, message, data: program }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  deleteProgram: async (id: string) => {
    try {
      const res = await axiosClient.delete(`${API_PREFIX}/programs/${id}`);
      return res.data; // { success, message }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },

  getProgramProgress: async (id: string) => {
    try {
      const res = await axiosClient.get(`${API_PREFIX}/programs/${id}/progress`);
      return res.data; // { success, data: { program, studentProgress } }
    } catch (err) {
      throw new Error(extractError(err));
    }
  },
};