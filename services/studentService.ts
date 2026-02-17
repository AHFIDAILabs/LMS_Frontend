// ============================================
// services/studentService.ts
// ============================================

import { axiosClient } from '@/lib/axiosClient';
import { ApiResponse } from '@/types';

export const studentService = {
  // =====================================================
  // DASHBOARD
  // =====================================================
  getDashboardOverview: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.get('/students/dashboard');
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch dashboard overview',
        data: null as any,
      };
    }
  },

  // =====================================================
  // PROGRAMS & COURSES
  // =====================================================
  getEnrolledPrograms: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await axiosClient.get('/students/programs');
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch enrolled programs',
        data: [],
      };
    }
  },

  getEnrolledCourses: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await axiosClient.get('/students/courses');
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch enrolled courses',
        data: [],
      };
    }
  },

  getProgramCourses: async (programId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.get(`/students/program/${programId}/courses`);
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch program courses',
        data: null as any,
      };
    }
  },

  getCourseModules: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.get(`/students/course/${courseId}/modules`);
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch course modules',
        data: null as any,
      };
    }
  },

  getModuleLessons: async (moduleId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.get(`/students/module/${moduleId}/lessons`);
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch module lessons',
        data: null as any,
      };
    }
  },

  getLessonDetails: async (lessonId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.get(`/students/lesson/${lessonId}`);
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch lesson details',
        data: null as any,
      };
    }
  },

  getCourseProgress: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.get(`/students/course/${courseId}/progress`);
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch course progress',
        data: null as any,
      };
    }
  },

  // =====================================================
  // NOTIFICATIONS
  // =====================================================
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<ApiResponse<any[]>> => {
    try {
      const response = await axiosClient.get('/students/notifications', { params });
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch notifications',
        data: [],
      };
    }
  },

  markNotificationRead: async (notificationId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.patch(`/students/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to mark notification as read',
        data: null as any,
      };
    }
  },

  markAllNotificationsRead: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.patch('/students/notifications/read-all');
      return {
        success: true,
        data: response.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to mark all notifications as read',
        data: null as any,
      };
    }
  },

  deleteNotification: async (notificationId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await axiosClient.delete(`/students/notifications/${notificationId}`);
      return {
        success: true,
        data: null,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete notification',
        data: null,
      };
    }
  },

  // =====================================================
  // RECENT ACTIVITY & STATISTICS
  // =====================================================
  getRecentActivity: async (limit = 10): Promise<ApiResponse<any[]>> => {
    try {
      const response = await axiosClient.get('/students/recent-activity', {
        params: { limit }
      });
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch recent activity',
        data: [],
      };
    }
  },

  getLearningStatistics: async (timeframe = 30): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.get('/students/statistics', {
        params: { timeframe }
      });
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch learning statistics',
        data: null as any,
      };
    }
  },

  // =====================================================
// LESSON ACTIONS (student)
// =====================================================
startLesson: async (lessonId: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosClient.post(`/lessons/${lessonId}/start`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return {
      success: false,
      data: null as any,
      error: error.response?.data?.error || error.message || 'Failed to start lesson',
    };
  }
},

completeLesson: async (lessonId: string, timeSpentMinutes = 0): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosClient.post(`/lessons/${lessonId}/complete`, { timeSpent: timeSpentMinutes });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return {
      success: false,
      data: null as any,
      error: error.response?.data?.error || error.message || 'Failed to complete lesson',
    };
  }
},
};


