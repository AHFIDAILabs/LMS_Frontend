// ============================================
// services/studentService.ts
// ============================================

import { fetchWithAuth, handleResponse } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const studentService = {
  // =====================================================
  // DASHBOARD
  // =====================================================
  getDashboardOverview: async () => {
    const response = await fetchWithAuth(`${API_URL}/student/dashboard`);
    return handleResponse(response);
  },

  // =====================================================
  // PROGRAMS & COURSES
  // =====================================================
  getEnrolledPrograms: async () => {
    const response = await fetchWithAuth(`${API_URL}/student/programs`);
    return handleResponse(response);
  },

  getEnrolledCourses: async () => {
    const response = await fetchWithAuth(`${API_URL}/student/courses`);
    return handleResponse(response);
  },

  getProgramCourses: async (programId: string) => {
    const response = await fetchWithAuth(`${API_URL}/student/program/${programId}/courses`);
    return handleResponse(response);
  },

  getCourseModules: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/student/course/${courseId}/modules`);
    return handleResponse(response);
  },

  getModuleLessons: async (moduleId: string) => {
    const response = await fetchWithAuth(`${API_URL}/student/module/${moduleId}/lessons`);
    return handleResponse(response);
  },

  getLessonDetails: async (lessonId: string) => {
    const response = await fetchWithAuth(`${API_URL}/student/lesson/${lessonId}`);
    return handleResponse(response);
  },

  getCourseProgress: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/student/course/${courseId}/progress`);
    return handleResponse(response);
  },

  // =====================================================
  // NOTIFICATIONS
  // =====================================================
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const response = await fetchWithAuth(
      `${API_URL}/student/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`
    );
    return handleResponse(response);
  },

  markNotificationRead: async (notificationId: string) => {
    const response = await fetchWithAuth(
      `${API_URL}/student/notifications/${notificationId}/read`,
      { method: 'PATCH' }
    );
    return handleResponse(response);
  },

  markAllNotificationsRead: async () => {
    const response = await fetchWithAuth(`${API_URL}/student/notifications/read-all`, {
      method: 'PATCH'
    });
    return handleResponse(response);
  },

  deleteNotification: async (notificationId: string) => {
    const response = await fetchWithAuth(
      `${API_URL}/student/notifications/${notificationId}`,
      { method: 'DELETE' }
    );
    return handleResponse(response);
  },

  // =====================================================
  // RECENT ACTIVITY
  // =====================================================
  getRecentActivity: async (limit = 10) => {
    const response = await fetchWithAuth(`${API_URL}/student/recent-activity?limit=${limit}`);
    return handleResponse(response);
  },

  // =====================================================
  // LEARNING STATISTICS
  // =====================================================
  getLearningStatistics: async (timeframe = 30) => {
    const response = await fetchWithAuth(`${API_URL}/student/statistics?timeframe=${timeframe}`);
    return handleResponse(response);
  },
};
