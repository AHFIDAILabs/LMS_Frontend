// services/submissionService.ts
// ============================================

import { axiosClient } from '@/lib/axiosClient';
import { ApiResponse } from '@/types';

export interface SubmissionPayload {
  assessmentId: string;
  answers: Array<{
    questionId: string;
    answer: string | string[];
  }>;
  courseId?: string;
  programId?: string;
  attachments?: string[];
}

export interface GradeSubmissionPayload {
  score: number;
  feedback?: string;
}

export const submissionService = {
  // =====================================================
  // CREATE SUBMISSION
  // =====================================================

  /**
   * Submit an assignment/assessment
   */
  createSubmission: async (data: SubmissionPayload): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.post('/submissions', data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to submit assignment',
        data: null as any,
      };
    }
  },

  /**
   * Upload file(s) for a submission (multipart/form-data)
   */
  uploadSubmissionFile: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosClient.post('/submissions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to upload file',
        data: null as any,
      };
    }
  },

  // =====================================================
  // GET SUBMISSIONS
  // =====================================================

  /**
   * Get a single submission by ID
   */
  getSubmission: async (submissionId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.get(`/submissions/${submissionId}`);
      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch submission',
        data: null as any,
      };
    }
  },

  /**
   * Get my submissions for a specific assessment
   */
  getMySubmissions: async (assessmentId: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await axiosClient.get(`/submissions/assessment/${assessmentId}/my-submissions`);
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch your submissions',
        data: [],
      };
    }
  },

  /**
   * Get submissions by assessment (for instructors/admins)
   */
  getSubmissionsByAssessment: async (
    assessmentId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<ApiResponse<any[]>> => {
    try {
      const response = await axiosClient.get(`/submissions/assessment/${assessmentId}`, { params });
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
        error: error.response?.data?.error || error.message || 'Failed to fetch submissions',
        data: [],
      };
    }
  },

  /**
   * Get submissions by student (for instructors/admins)
   */
  getSubmissionsByStudent: async (
    studentId: string,
    params?: { page?: number; limit?: number; courseId?: string }
  ): Promise<ApiResponse<any[]>> => {
    try {
      const response = await axiosClient.get(`/submissions/student/${studentId}`, { params });
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
        error: error.response?.data?.error || error.message || 'Failed to fetch student submissions',
        data: [],
      };
    }
  },

  // =====================================================
  // GRADE SUBMISSION (Instructor/Admin)
  // =====================================================

  /**
   * Grade a submission
   */
  gradeSubmission: async (
    submissionId: string,
    data: GradeSubmissionPayload
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.patch(`/submissions/${submissionId}/grade`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to grade submission',
        data: null as any,
      };
    }
  },

  // =====================================================
  // UPDATE/DELETE SUBMISSION
  // =====================================================

  /**
   * Update a submission (before grading)
   */
  updateSubmission: async (
    submissionId: string,
    data: Partial<SubmissionPayload>
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.patch(`/submissions/${submissionId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update submission',
        data: null as any,
      };
    }
  },

  /**
   * Delete a submission (before grading)
   */
  deleteSubmission: async (submissionId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await axiosClient.delete(`/submissions/${submissionId}`);
      return {
        success: true,
        data: null,
        message: response.data.message,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete submission',
        data: null,
      };
    }
  },
};
