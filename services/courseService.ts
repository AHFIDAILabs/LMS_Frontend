// ============================================
// services/courseService.ts
// ============================================

import { axiosClient } from '@/lib/axiosClient';
import { ApiResponse, Course, CourseCreatePayload, CourseContentResponse, CoursesListResponse } from '@/types';

export const courseService = {
  // =====================================================
  // PUBLIC - Get All Courses
  // =====================================================
  getAllCourses: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    programId?: string;
    sort?: string;
  }): Promise<ApiResponse<Course[]>> => {
    try {
      const response = await axiosClient.get('/courses', { params });
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
        error: error.response?.data?.error || error.message || 'Failed to fetch courses',
        data: [],
      };
    }
  },

  // =====================================================
  // PUBLIC - Get Course by ID
  // =====================================================
  getCourseById: async (courseId: string): Promise<ApiResponse<Course>> => {
    try {
      const response = await axiosClient.get(`/courses/${courseId}`);
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch course',
        data: null as any,
      };
    }
  },

  
  // =====================================================
  // STUDENT - Get My Courses
  // =====================================================
  getMyCourses: async (): Promise<Course[]> => {
    try {
      const response = await axiosClient.get('/courses/student/my-courses');
      
      if (!response.data.success) {
        throw new Error(response.data.message || response.data.error || 'Failed to fetch courses');
      }

      // Guarantee we always return an array
      if (!Array.isArray(response.data.data)) {
        return [];
      }

      return response.data.data;
    } catch (error: any) {
      console.error('getMyCourses error:', error);
      return [];
    }
  },

  // =====================================================
  // STUDENT - Enroll in Course
  // =====================================================
  enrollInCourse: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.post(`/courses/${courseId}/enroll`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to enroll in course',
        data: null as any,
      };
    }
  },

  // =====================================================
  // ADMIN/INSTRUCTOR - Get All Courses (Admin View)
  // =====================================================
  getAllCoursesAdmin: async (params?: {
    isPublished?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    programId?: string;
  }): Promise<ApiResponse<Course[]>> => {
    try {
      const response = await axiosClient.get('/courses/admin/all', { params });
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
        error: error.response?.data?.error || error.message || 'Failed to fetch courses',
        data: [],
      };
    }
  },

  // =====================================================
  // ADMIN/INSTRUCTOR - Create Course
  // =====================================================
  createCourse: async (data: CourseCreatePayload | FormData): Promise<ApiResponse<Course>> => {
    try {
      let headers: any = {};

      // If not FormData, set Content-Type
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await axiosClient.post('/courses/admin/create', data, { headers });

      return {
        success: true,
        data: response.data.data || response.data.course,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create course',
        data: null as any,
      };
    }
  },

  // =====================================================
  // ADMIN/INSTRUCTOR - Update Course
  // =====================================================
  updateCourse: async (
    courseId: string,
    data: Partial<CourseCreatePayload> | FormData
  ): Promise<ApiResponse<Course>> => {
    try {
      let headers: any = {};

      // If not FormData, set Content-Type
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await axiosClient.put(`/courses/admin/${courseId}`, data, { headers });

      return {
        success: true,
        data: response.data.data || response.data.course,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update course',
        data: null as any,
      };
    }
  },

  // =====================================================
  // ADMIN/INSTRUCTOR - Delete Course
  // =====================================================
  deleteCourse: async (courseId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await axiosClient.delete(`/courses/admin/${courseId}`);
      return {
        success: true,
        data: null,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete course',
        data: null,
      };
    }
  },

  // =====================================================
  // ADMIN - Approve Course
  // =====================================================
  approveCourse: async (courseId: string): Promise<ApiResponse<Course>> => {
    try {
      const response = await axiosClient.post(`/courses/admin/${courseId}/approve`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to approve course',
        data: null as any,
      };
    }
  },

  // =====================================================
  // ADMIN - Reject Course
  // =====================================================
  rejectCourse: async (courseId: string): Promise<ApiResponse<Course>> => {
    try {
      const response = await axiosClient.post(`/courses/admin/${courseId}/reject`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to reject course',
        data: null as any,
      };
    }
  },

  // =====================================================
  // ADMIN/INSTRUCTOR - Toggle Publish
  // =====================================================
  togglePublish: async (courseId: string): Promise<ApiResponse<Course>> => {
    try {
      const response = await axiosClient.patch(`/courses/admin/${courseId}/publish`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to toggle publish status',
        data: null as any,
      };
    }
  },

  // =====================================================
  // ADMIN/INSTRUCTOR - Get Course Content
  // =====================================================
  getCourseContent: async (courseId: string): Promise<ApiResponse<CourseContentResponse['data']>> => {
    try {
      const response = await axiosClient.get(`/courses/admin/${courseId}/content`);
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch course content',
        data: null as any,
      };
    }
  },

  // =====================================================
  // ADMIN/INSTRUCTOR - Get Course Enrollments
  // =====================================================
  getCourseEnrollments: async (
    courseId: string,
    params?: {
      status?: string;
      cohort?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<any[]>> => {
    try {
      const response = await axiosClient.get(`/courses/admin/${courseId}/enrollments`, { params });
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
        error: error.response?.data?.error || error.message || 'Failed to fetch course enrollments',
        data: [],
      };
    }
  },

  // =====================================================
  // ADMIN/INSTRUCTOR - Get Course Stats
  // =====================================================
  getCourseStats: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.get(`/courses/admin/${courseId}/stats`);
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch course stats',
        data: null as any,
      };
    }
  },
};