// ============================================
// services/lessonService.ts
// ============================================

import { axiosClient } from '@/lib/axiosClient';

export const lessonService = {
  // =====================================================
  // PUBLIC
  // =====================================================

  // Get published lessons in a module
  getLessonsByModule: async (
    moduleId: string,
    includeUnpublished = false,
    params?: { page?: number; limit?: number }
  ) => {
    try {
      const queryParams = new URLSearchParams({
        ...(params as any),
        includeUnpublished: includeUnpublished.toString(),
      });
      
      const { data } = await axiosClient.get(
        `/lessons/module/${moduleId}?${queryParams.toString()}`
      );
      return data;
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  // Get lesson details
  getLessonById: async (lessonId: string) => {
    try {
      const { data } = await axiosClient.get(`/lessons/${lessonId}`);
      return data;
    } catch (error: any) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  },

  // Get all published lessons
  getPublishedLessons: async (params?: {
    page?: number;
    limit?: number;
    moduleId?: string;
    type?: string;
  }) => {
    try {
      const query = new URLSearchParams(params as any).toString();
      const { data } = await axiosClient.get(`/lessons/published?${query}`);
      return data;
    } catch (error: any) {
      console.error('Error fetching published lessons:', error);
      throw error;
    }
  },

  // =====================================================
  // STUDENT ACTIONS
  // =====================================================

  // Start lesson
  startLesson: async (lessonId: string) => {
    try {
      const { data } = await axiosClient.post(`/lessons/${lessonId}/start`);
      return data;
    } catch (error: any) {
      console.error('Error starting lesson:', error);
      throw error;
    }
  },

  // Complete lesson
  completeLesson: async (lessonId: string, timeSpentMinutes: number) => {
    try {
      const { data } = await axiosClient.post(`/lessons/${lessonId}/complete`, {
        timeSpent: timeSpentMinutes,
      });
      return data;
    } catch (error: any) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  },

  // Get course progress
  getCourseProgress: async (courseId: string) => {
    try {
      const { data } = await axiosClient.get(`/lessons/course/${courseId}/progress`);
      return data;
    } catch (error: any) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  },

  // Get lesson progress
  getLessonProgress: async (lessonId: string) => {
    try {
      const { data } = await axiosClient.get(`/lessons/${lessonId}/progress`);
      return data;
    } catch (error: any) {
      console.error('Error fetching lesson progress:', error);
      throw error;
    }
  },

  // =====================================================
  // INSTRUCTOR / ADMIN
  // =====================================================

  // Create lesson (with file uploads)
  createLesson: async (formData: FormData) => {
    try {
      const { data } = await axiosClient.post('/lessons', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error: any) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  },

  // Update lesson
  updateLesson: async (lessonId: string, payload: FormData | object) => {
    try {
      const config =
        payload instanceof FormData
          ? { headers: { 'Content-Type': 'multipart/form-data' } }
          : {};

      const { data } = await axiosClient.put(`/lessons/${lessonId}`, payload, config);
      return data;
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  },

  // Delete lesson
  deleteLesson: async (lessonId: string) => {
    try {
      const { data } = await axiosClient.delete(`/lessons/${lessonId}`);
      return data;
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  },

  // Toggle publish status
  togglePublish: async (lessonId: string) => {
    try {
      const { data } = await axiosClient.patch(`/lessons/${lessonId}/publish`);
      return data;
    } catch (error: any) {
      console.error('Error toggling publish status:', error);
      throw error;
    }
  },

  // Reorder lessons
  reorderLessons: async (orders: { lessonId: string; order: number }[]) => {
    try {
      const { data } = await axiosClient.patch('/lessons/reorder', { orders });
      return data;
    } catch (error: any) {
      console.error('Error reordering lessons:', error);
      throw error;
    }
  },

  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  // Get all lessons (admin)
  getAllLessonsAdmin: async (params?: {
    page?: number;
    limit?: number;
    moduleId?: string;
    type?: string;
    isPublished?: boolean;
  }) => {
    try {
      const query = new URLSearchParams(params as any).toString();
      const { data } = await axiosClient.get(`/lessons/admin/all?${query}`);
      return data;
    } catch (error: any) {
      console.error('Error fetching admin lessons:', error);
      throw error;
    }
  },

  // Get lesson statistics
  getLessonStats: async (params?: { moduleId?: string; courseId?: string }) => {
    try {
      const query = new URLSearchParams(params as any).toString();
      const { data } = await axiosClient.get(`/lessons/stats?${query}`);
      return data;
    } catch (error: any) {
      console.error('Error fetching lesson stats:', error);
      throw error;
    }
  },
};