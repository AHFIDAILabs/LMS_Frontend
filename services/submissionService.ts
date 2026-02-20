// ============================================
// services/submissionService.ts
// Single source of truth for all submission operations.
// Student-facing endpoints: /submissions/...
// Instructor-facing endpoints: /instructors/submissions/... or /instructors/assessments/...
// ============================================

import { axiosClient } from '@/lib/axiosClient'
import { ApiResponse } from '@/types'

const extractError = (err: any): string => {
  const data = err?.response?.data
  if (!data) return err.message || 'Request failed'
  if (data.error) return data.error
  if (data.message) return data.message
  if (data.errors) {
    if (Array.isArray(data.errors) && data.errors[0]?.msg) return data.errors[0].msg
    if (typeof data.errors === 'object') {
      const first = Object.values(data.errors)[0]
      if (Array.isArray(first) && first[0]) return first[0] as string
    }
  }
  return 'Something went wrong'
}

export interface SubmissionPayload {
  assessmentId: string
  answers: Array<{ questionId: string; answer: string | string[] }>
  courseId?: string
  programId?: string
  attachments?: string[]
}

export interface GradeSubmissionPayload {
  score: number
  feedback?: string
}

export const submissionService = {
  // =====================================================
  // STUDENT — create / view own submissions
  // =====================================================

  /** Submit an assessment */
  createSubmission: async (data: SubmissionPayload): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.post('/submissions', data)
      return { success: true, data: res.data.data, message: res.data.message, error: undefined }
    } catch (err: any) {
      return { success: false, error: extractError(err), data: null }
    }
  },

  /** Upload a file attachment for a submission */
  uploadSubmissionFile: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await axiosClient.post('/submissions/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { success: true, data: res.data.data, error: undefined }
    } catch (err: any) {
      return { success: false, error: extractError(err), data: null as any }
    }
  },

  /** Get the logged-in student's own submissions for an assessment */
  getMySubmissions: async (assessmentId: string): Promise<ApiResponse<any[]>> => {
    try {
      const res = await axiosClient.get(
        `/submissions/assessment/${assessmentId}/my-submissions`
      )
      return { success: true, data: res.data.data, count: res.data.count, error: undefined }
    } catch (err: any) {
      return { success: false, error: extractError(err), data: [] }
    }
  },

  /** Update a submission before it has been graded */
  updateSubmission: async (
    submissionId: string,
    data: Partial<SubmissionPayload>
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.patch(`/submissions/${submissionId}`, data)
      return { success: true, data: res.data.data, message: res.data.message, error: undefined }
    } catch (err: any) {
      return { success: false, error: extractError(err), data: null }
    }
  },

  /** Delete a submission before it has been graded */
  deleteSubmission: async (submissionId: string): Promise<ApiResponse<null>> => {
    try {
      const res = await axiosClient.delete(`/submissions/${submissionId}`)
      return { success: true, data: null, message: res.data.message, error: undefined }
    } catch (err: any) {
      return { success: false, error: extractError(err), data: null }
    }
  },

  // =====================================================
  // INSTRUCTOR — view & grade submissions
  // =====================================================

  /**
   * All submissions for a specific assessment (instructor).
   * Used by: AssessmentSubmissionsPage
   * GET /api/v1/instructors/assessments/:assessmentId/submissions
   */
  getSubmissionsByAssessment: async (
    assessmentId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<ApiResponse<any[]>> => {
    try {
      // Strip empty/undefined values
      const cleanParams: Record<string, any> = {}
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          if (v !== undefined && v !== null && v !== '') cleanParams[k] = v
        }
      }
      const res = await axiosClient.get(
        `/instructors/assessments/${assessmentId}/submissions`,
        { params: cleanParams }
      )
      return {
        success: true,
        data: res.data.data,
        count: res.data.count,
        total: res.data.total,
        page: res.data.page,
        pages: res.data.pages,
        error: undefined,
      }
    } catch (err: any) {
      return { success: false, error: extractError(err), data: [] }
    }
  },

  /**
   * Single submission with student + assessment (incl. questions) populated.
   * Used by: SubmissionDetailPage
   * GET /api/v1/instructors/submissions/:submissionId
   */
  getSubmission: async (submissionId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.get(`/submissions/${submissionId}`)
      return { success: true, data: res.data.data, error: undefined }
    } catch (err: any) {
      return { success: false, error: extractError(err), data: null }
    }
  },

  /**
   * Grade a submission.
   * Used by: SubmissionDetailPage  →  gradeSubmission(id, { score, feedback })
   * PUT /api/v1/instructors/submissions/:submissionId/grade
   */
  gradeSubmission: async (
    submissionId: string,
    payload: GradeSubmissionPayload
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.put(
        `/submissions/${submissionId}/grade`,
        payload
      )
      return { success: true, data: res.data.data, message: res.data.message, error: undefined }
    } catch (err: any) {
      return { success: false, error: extractError(err), data: null }
    }
  },

  /**
   * All submissions for a specific student (instructor/admin view).
   * GET /api/v1/instructors/submissions/student/:studentId  (or your existing route)
   */
  getSubmissionsByStudent: async (
    studentId: string,
    params?: { page?: number; limit?: number; courseId?: string }
  ): Promise<ApiResponse<any[]>> => {
    try {
      const res = await axiosClient.get(`/submissions/student/${studentId}`, { params })
      return {
        success: true,
        data: res.data.data,
        count: res.data.count,
        total: res.data.total,
        page: res.data.page,
        pages: res.data.pages,
        error: undefined,
      }
    } catch (err: any) {
      return { success: false, error: extractError(err), data: [] }
    }
  },

  /**
   * All pending submissions across all instructor courses.
   * GET /api/v1/instructors/submissions/pending
   */
  getPendingSubmissions: async (params?: {
    courseId?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<any[]>> => {
    try {
      const res = await axiosClient.get('/instructors/submissions/pending', { params })
      return {
        success: true,
        data: res.data.data,
        count: res.data.count,
        total: res.data.total,
        page: res.data.page,
        pages: res.data.pages,
        error: undefined,
      }
    } catch (err: any) {
      return { success: false, error: extractError(err), data: [] }
    }
  },
}