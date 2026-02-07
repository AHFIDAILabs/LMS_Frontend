// ============================================
// services/scholarshipService.ts
// ============================================
import { axiosClient } from '@/lib/axiosClient'

export interface ScholarshipParams {
  status?: string
  programId?: string
  page?: number
  limit?: number
}

export interface CreateScholarshipData {
  programId: string
  studentEmail?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  expiresAt?: string
  notes?: string
  sendEmail?: boolean
}

export interface BulkCreateScholarshipData {
  programId: string
  quantity: number
  discountType: 'percentage' | 'fixed'
  discountValue: number
  expiresAt?: string
  notes?: string
}

export interface UpdateScholarshipData {
  status?: string
  expiresAt?: string
  notes?: string
}

export const scholarshipService = {
  // =====================================================
  // GET ALL SCHOLARSHIPS
  // =====================================================
  getAllScholarships: async (params?: ScholarshipParams) => {
    try {
      const response = await axiosClient.get('/scholarships', { params })
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      }
    }
  },

  // =====================================================
  // GET SINGLE SCHOLARSHIP BY ID
  // =====================================================
  getScholarshipById: async (scholarshipId: string) => {
    try {
      const response = await axiosClient.get(`/scholarships/${scholarshipId}`)
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      }
    }
  },

  // =====================================================
  // CREATE SCHOLARSHIP
  // =====================================================
  createScholarship: async (data: CreateScholarshipData) => {
    try {
      const response = await axiosClient.post('/scholarship', data)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      }
    }
  },

  // =====================================================
  // BULK CREATE SCHOLARSHIPS
  // =====================================================
  bulkCreateScholarships: async (data: BulkCreateScholarshipData) => {
    try {
      const response = await axiosClient.post('/scholarship/bulk', data)
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      }
    }
  },

  // =====================================================
  // UPDATE SCHOLARSHIP
  // =====================================================
  updateScholarship: async (
    scholarshipId: string,
    data: UpdateScholarshipData
  ) => {
    try {
      const response = await axiosClient.put(`/scholarship/${scholarshipId}`, data)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      }
    }
  },

  // =====================================================
  // DELETE SCHOLARSHIP
  // =====================================================
  deleteScholarship: async (scholarshipId: string) => {
    try {
      const response = await axiosClient.delete(`/scholarship/${scholarshipId}`)
      return {
        success: true,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      }
    }
  },

  // =====================================================
  // GET SCHOLARSHIP STATISTICS
  // =====================================================
  getScholarshipStats: async (programId?: string) => {
    try {
      const params = programId ? { programId } : {}
      const response = await axiosClient.get('/scholarship/stats', { params })
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: null,
      }
    }
  },
}