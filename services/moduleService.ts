// services/moduleService.ts
import { ApiResponse } from '@/types'
import { axiosClient } from '@/lib/axiosClient'

// =============================
// Error helper
// =============================
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

export const moduleService = {
  // =====================================================
  // PUBLIC (Students)
  // =====================================================

 // =========================
  // GET MODULES BY COURSE
  // =========================
  getModulesByCourse: async (
    courseId: string,
    includeUnpublished?: boolean
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.get(`/modules/course/${courseId}`, {
        params: { includeUnpublished },
      })
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

// =========================
  // GET SINGLE MODULE
  // =========================
  getModule: async (moduleId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.get(`/modules/${moduleId}`)
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },
  // =====================================================
  // ADMIN / INSTRUCTOR
  // =====================================================

 // =========================
  // CREATE MODULE
  // =========================
  createModule: async (data: {
    courseId: string
    title: string
    description: string
    learningObjectives?: string[]
    weekNumber?: number
    sequenceLabel?: string
    estimatedMinutes?: number
    type?: 'core' | 'capstone' | 'project' | 'assessment'
    order?: number
  }): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.post('/modules', data)
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  

// =========================
  // UPDATE MODULE
  // =========================
  updateModule: async (
    moduleId: string,
    data: {
      title?: string
      description?: string
      learningObjectives?: string[]
      sequenceLabel?: string
      estimatedMinutes?: number
      type?: 'core' | 'supplementary' | 'project' | 'assessment'
      order?: number
    }
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.put(`/modules/${moduleId}`, data)
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

 // =========================
  // DELETE MODULE
  // =========================
  deleteModule: async (moduleId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.delete(`/modules/${moduleId}`)
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

 // =========================
  // TOGGLE PUBLISH
  // =========================
  togglePublish: async (moduleId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.patch(`/modules/${moduleId}/toggle-publish`)
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  // =========================
  // REORDER MODULES
  // =========================
  reorderModules: async (orders: Array<{ moduleId: string; order: number }>): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.put('/modules/reorder', { orders })
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  // Get module stats
  getModuleStats: async (courseId?: string) => {
    const query = courseId ? `?courseId=${courseId}` : ''
    const { data } = await axiosClient.get(`/modules/stats/overview${query}`)
    return data
  },

    // =========================
  // GET MODULE CONTENT (with lessons)
  // =========================
  getModuleContent: async (moduleId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.get(`/modules/${moduleId}/content`)
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },


  
  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  // Get all modules (admin)
  getAllModulesAdmin: async (params?: {
    page?: number
    limit?: number
    courseId?: string
    type?: string
    isPublished?: boolean
  }) => {
    const query = new URLSearchParams(params as any).toString()
    const { data } = await axiosClient.get(`/modules?${query}`)
    return data
  },
}
