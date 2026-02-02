import { ApiResponse } from '@/types';
import { fetchWithAuth, handleResponse } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const instructorService = {
  // =========================
  // PROFILE
  // =========================
  getProfile: async () => {
    const res = await fetchWithAuth(`${API_URL}/instructors/me`);
    return handleResponse(res);
  },

  updateProfile: async (data: FormData | {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    bio?: string;
    linkedinProfile?: string;
    deleteProfileImage?: boolean;
  }) => {
    const headers: any = {};
    // Don't set Content-Type for FormData
    if (!(data instanceof FormData)) headers['Content-Type'] = 'application/json';
    const res = await fetchWithAuth(`${API_URL}/instructors/me`, {
      method: 'PUT',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // =========================
  // COURSES
  // =========================


  createCourse: async (data: {
  title: string;
  description: string;
  programId: string; // ❗ required
  modules?: Array<any>;
  startDate?: Date | string;
  endDate?: Date | string;
}): Promise<ApiResponse<any>> => {
  const res = await fetchWithAuth(`${API_URL}/instructor/courses`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return handleResponse(res);
},



  getCourses: async (params?: { isPublished?: boolean; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetchWithAuth(`${API_URL}/instructors/courses?${query}`);
    return handleResponse(res);
  },

  getCourse: async (courseId: string) => {
    const res = await fetchWithAuth(`${API_URL}/instructors/courses/${courseId}`);
    return handleResponse(res);
  },

  // =========================
  // STUDENTS
  // =========================
  getStudents: async (params?: { courseId?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetchWithAuth(`${API_URL}/instructors/students?${query}`);
    return handleResponse(res);
  },

  getStudentProgress: async (studentId: string, courseId: string) => {
    const res = await fetchWithAuth(`${API_URL}/instructors/students/${studentId}/courses/${courseId}/progress`);
    return handleResponse(res);
  },

  // =========================
  // ASSESSMENTS & SUBMISSIONS
  // =========================
  getPendingSubmissions: async (params?: { courseId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetchWithAuth(`${API_URL}/instructors/submissions/pending?${query}`);
    return handleResponse(res);
  },

  gradeSubmission: async (submissionId: string, score: number, feedback?: string) => {
    const res = await fetchWithAuth(`${API_URL}/instructors/submissions/${submissionId}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ score, feedback }),
    });
    return handleResponse(res);
  },

  // =========================
  // ANNOUNCEMENTS
  // =========================
  sendAnnouncement: async (courseId: string, title: string, message: string) => {
    const res = await fetchWithAuth(`${API_URL}/instructors/courses/${courseId}/announcements`, {
      method: 'POST',
      body: JSON.stringify({ title, message }),
    });
    return handleResponse(res);
  },

  // =========================
  // DASHBOARD
  // =========================
  getDashboardStats: async () => {
    const res = await fetchWithAuth(`${API_URL}/instructors/dashboard/stats`);
    return handleResponse(res);
  }
};
