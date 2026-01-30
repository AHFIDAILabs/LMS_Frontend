// ============================================
// services/courseService.ts
// ============================================

import { handleResponse, fetchWithAuth } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const courseService = {
  // =====================================================
  // PUBLIC
  // =====================================================
  getAllCourses: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    programId?: string;
    sort?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_URL}/courses?${query}`);
    return handleResponse(response);
  },

  getCourseById: async (courseId: string) => {
    const response = await fetch(`${API_URL}/courses/${courseId}`);
    return handleResponse(response);
  },

  // =====================================================
  // STUDENT
  // =====================================================
 getMyCourses: async () => {
  const response = await fetchWithAuth(`${API_URL}/courses/student/my-courses`, {
    credentials: 'include', // Add this
  });
  return handleResponse(response);
},

  enrollInCourse: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  // =====================================================
  // ADMIN / INSTRUCTOR — COURSE MANAGEMENT
  // =====================================================
  getAllCoursesAdmin: async (params?: {
    isPublished?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    programId?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetchWithAuth(`${API_URL}/courses/admin/all?${query}`);
    return handleResponse(response);
  },

  createCourse: async (data: FormData | any) => {
    const response = await fetchWithAuth(`${API_URL}/courses/admin/create`, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers: data instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  updateCourse: async (courseId: string, data: FormData | any) => {
    const response = await fetchWithAuth(`${API_URL}/courses/admin/${courseId}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers: data instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  deleteCourse: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/courses/admin/${courseId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  approveCourse: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/courses/admin/${courseId}/approve`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  rejectCourse: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/courses/admin/${courseId}/reject`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  togglePublish: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/courses/admin/${courseId}/publish`, {
      method: 'PATCH',
    });
    return handleResponse(response);
  },

  // =====================================================
  // COURSE CONTENT / ANALYTICS
  // =====================================================
  getCourseContent: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/courses/admin/${courseId}/content`);
    return handleResponse(response);
  },

  getCourseEnrollments: async (
    courseId: string,
    params?: { status?: string; cohort?: string; page?: number; limit?: number }
  ) => {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetchWithAuth(`${API_URL}/courses/admin/${courseId}/enrollments?${query}`);
    return handleResponse(response);
  },

  getCourseStats: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/courses/admin/${courseId}/stats`);
    return handleResponse(response);
  },
};
