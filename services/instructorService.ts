// ============================================
// services/instructorService.ts
// Submission-related methods that used to live here have moved to
// submissionService.ts. The gradeSubmission here is kept for any
// legacy callers but delegates to the correct payload shape.
// ============================================

import { ApiResponse } from '@/types'
import { axiosClient } from '@/lib/axiosClient'

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

export const instructorService = {
  // =========================
  // PROFILE
  // =========================
  getProfile: async () => {
    try {
      const res = await axiosClient.get('/instructors/me')
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  updateProfile: async (
    data:
      | FormData
      | {
          firstName?: string
          lastName?: string
          phoneNumber?: string
          bio?: string
          linkedinProfile?: string
          deleteProfileImage?: boolean
        }
  ) => {
    try {
      if (data instanceof FormData) {
        const cleanedData = new FormData()
        for (const [key, value] of data.entries()) {
          if (value instanceof File) {
            cleanedData.append(key, value)
          } else if (typeof value === 'string' && value.trim() !== '') {
            cleanedData.append(key, value.trim())
          } else if (typeof value !== 'string' && value !== null && value !== undefined) {
            cleanedData.append(key, value)
          }
        }
        data = cleanedData
      }
      const res = await axiosClient.put('/instructors/me', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  // =========================
  // COURSES
  // =========================
  createCourse: async (data: FormData | Record<string, any>): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.post('/instructors/courses', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  getCourses: async (params?: {
    isPublished?: boolean
    search?: string
    page?: number
    limit?: number
  }) => {
    try {
      const res = await axiosClient.get('/instructors/courses', { params })
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  getCourse: async (courseId: string) => {
    try {
      const res = await axiosClient.get(`/instructors/courses/${courseId}`)
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  // =========================
  // STUDENTS
  // =========================
  getStudents: async (params?: {
    courseId?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }) => {
    try {
      const cleanParams: Record<string, any> = {}
      if (params) {
        for (const [key, val] of Object.entries(params)) {
          if (val !== undefined && val !== null && val !== '') {
            cleanParams[key] = val
          }
        }
      }
      const res = await axiosClient.get('/instructors/students', { params: cleanParams })
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  getStudentProgress: async (studentId: string, courseId: string) => {
    try {
      const res = await axiosClient.get(
        `/instructors/students/${studentId}/courses/${courseId}/progress`
      )
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  // =========================
  // CONTENT
  // =========================
  getInstructorModules: async () => {
    try {
      const res = await axiosClient.get('/instructors/content/modules')
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  getInstructorLessons: async () => {
    try {
      const res = await axiosClient.get('/instructors/content/lessons')
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  getInstructorAssessments: async () => {
    try {
      const res = await axiosClient.get('/instructors/content/assessments')
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  // =========================
  // SUBMISSIONS
  // NOTE: Prefer importing directly from submissionService for submission
  // operations. These are kept here only for backward-compat with any
  // existing pages that import from instructorService.
  // =========================

  getPendingSubmissions: async (params?: {
    courseId?: string
    page?: number
    limit?: number
  }) => {
    try {
      const res = await axiosClient.get('/instructors/submissions/pending', { params })
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  /**
   * Grade a submission.
   * Legacy signature kept for backward compat: (id, score, feedback?)
   * New pages should use submissionService.gradeSubmission(id, { score, feedback })
   */
  gradeSubmission: async (submissionId: string, score: number, feedback?: string) => {
    try {
      const res = await axiosClient.put(
        `/instructors/submissions/${submissionId}/grade`,
        { score, feedback }
      )
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  getSubmissionsByAssessment: async (
    assessmentId: string,
    params?: { page?: number; limit?: number; status?: string }
  ) => {
    try {
      const res = await axiosClient.get(
        `/instructors/assessments/${assessmentId}/submissions`,
        { params }
      )
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  getSubmissionById: async (submissionId: string) => {
    try {
      const res = await axiosClient.get(`/instructors/submissions/${submissionId}`)
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  // =========================
  // ANNOUNCEMENTS
  // =========================
  sendAnnouncement: async (courseId: string, title: string, message: string) => {
    try {
      const res = await axiosClient.post(`/instructors/courses/${courseId}/announcements`, {
        title,
        message,
      })
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  // =========================
  // DASHBOARD
  // =========================
  getDashboardStats: async () => {
    try {
      const res = await axiosClient.get('/instructors/dashboard/stats')
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },
}