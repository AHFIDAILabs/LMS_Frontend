// ============================================
// services/lessonService.ts
// ============================================

import { fetchWithAuth, handleResponse } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const lessonService = {
  // =====================================================
  // PUBLIC
  // =====================================================

  // Get published lessons in a module
  getLessonsByModule: async (moduleId: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetchWithAuth(`${API_URL}/lessons/module/${moduleId}?${query}`);
    return handleResponse(response);
  },

  // Get lesson details
  getLessonById: async (lessonId: string) => {
    const response = await fetchWithAuth(`${API_URL}/lessons/${lessonId}`);
    return handleResponse(response);
  },

  // =====================================================
  // STUDENT ACTIONS
  // =====================================================

  // Start lesson
  startLesson: async (lessonId: string) => {
    const response = await fetchWithAuth(`${API_URL}/lessons/${lessonId}/start`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  // Complete lesson
  completeLesson: async (lessonId: string, timeSpentMinutes: number) => {
    const response = await fetchWithAuth(`${API_URL}/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ timeSpent: timeSpentMinutes }),
    });
    return handleResponse(response);
  },

  // Get course progress
  getCourseProgress: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/lessons/course/${courseId}/progress`);
    return handleResponse(response);
  },

  // =====================================================
  // INSTRUCTOR / ADMIN
  // =====================================================

  // Create lesson (multipart)
  createLesson: async (formData: FormData) => {
    const response = await fetchWithAuth(`${API_URL}/lessons`, {
      method: 'POST',
      body: formData, // IMPORTANT: do NOT set Content-Type manually
    });
    return handleResponse(response);
  },

  // Update lesson
  updateLesson: async (lessonId: string, data: FormData | object) => {
    const response = await fetchWithAuth(`${API_URL}/lessons/${lessonId}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    return handleResponse(response);
  },


  getLessonProgress: async (lessonId: string) => {
  const response = await fetchWithAuth(`${API_URL}/lessons/${lessonId}/progress`);
  return handleResponse(response);
},

getLessonStats: async (params?: { moduleId?: string; courseId?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetchWithAuth(`${API_URL}/lessons/stats?${query}`);
  return handleResponse(response);
},

getAllLessonsAdmin: async (params?: any) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetchWithAuth(`${API_URL}/lessons/admin/all?${query}`);
  return handleResponse(response);
},


  // Delete lesson
  deleteLesson: async (lessonId: string) => {
    const response = await fetchWithAuth(`${API_URL}/lessons/${lessonId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Publish / Unpublish
  togglePublish: async (lessonId: string) => {
    const response = await fetchWithAuth(`${API_URL}/lessons/${lessonId}/publish`, {
      method: 'PATCH',
    });
    return handleResponse(response);
  },
};
