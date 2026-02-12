import { UserProfileResponse } from '@/types'
import { axiosClient } from '@/lib/axiosClient'

interface AuthResponse {
  success: boolean
  accessToken?: string
  refreshToken?: string
  user?: any
  data?: any
  message?: string
  error?: string
  errors?: any
}

interface ServiceResponse {
  success: boolean
  token?: string
  refreshToken?: string
  data?: any
  message?: string
  error?: boolean  // Add this optional property
}

// =============================
// Helpers
// =============================
const extractError = (err: any): string => {
  const data = err?.response?.data
  if (!data) return err.message || 'Request failed'

  if (data.error) return data.error
  if (data.message) return data.message

  if (data.errors) {
    if (Array.isArray(data.errors) && data.errors[0]?.msg) {
      return data.errors[0].msg
    }
    if (typeof data.errors === 'object') {
      const first = Object.values(data.errors)[0]
      if (Array.isArray(first) && first[0]) return first[0] as string
    }
  }

  return 'Something went wrong'
}

const normaliseUser = (user: any) => {
  if (!user) return user
  if (!user._id && user.id) user._id = user.id
  return user
}

// =============================
// Service
// =============================
export const authService = {
  // -----------------------------
  // PUBLIC
  // -----------------------------
  register: async (data: any): Promise<ServiceResponse> => {
    try {
      const res = await axiosClient.post<AuthResponse>('/auth/register', data)
      const result = res.data

      if (result.accessToken) {
        localStorage.setItem('authToken', result.accessToken)
        if (result.refreshToken) localStorage.setItem('refreshToken', result.refreshToken)
      }

      return {
        success: result.success,
        token: result.accessToken,
        refreshToken: result.refreshToken,
        data: normaliseUser(result.user),
      }
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  login: async (credentials: { email: string; password: string }): Promise<ServiceResponse> => {
    try {
      const res = await axiosClient.post<AuthResponse>('/auth/login', credentials)
      const result = res.data

      if (result.success === false) throw new Error(result.message)

      if (result.accessToken) {
        localStorage.setItem('authToken', result.accessToken)
        if (result.refreshToken) localStorage.setItem('refreshToken', result.refreshToken)
      }

      return {
        success: true,
        token: result.accessToken,
        refreshToken: result.refreshToken,
        data: normaliseUser(result.user),
      }
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  refreshToken: async (): Promise<ServiceResponse> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      const res = await axiosClient.post<AuthResponse>('/auth/refresh', { refreshToken })
      const result = res.data

      if (result.accessToken) {
        localStorage.setItem('authToken', result.accessToken)
        if (result.refreshToken) localStorage.setItem('refreshToken', result.refreshToken)
      }

      return {
        success: result.success,
        token: result.accessToken,
        refreshToken: result.refreshToken,
        data: normaliseUser(result.user),
      }
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  forgotPassword: (email: string) =>
    axiosClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    axiosClient.put(`/auth/reset-password/${token}`, { password }),

  verifyEmail: (token: string) =>
    axiosClient.get(`/auth/verify-email/${token}`),

  // -----------------------------
  // PROTECTED
  // -----------------------------
async getMe() {
    try {
      const token = this.getToken()
      
      console.log('🔍 getMe Debug:')
      console.log('- Token exists:', !!token)
      console.log('- Token (first 20 chars):', token?.substring(0, 20))
      
      
      if (!token) {
        console.log('❌ No token found in localStorage')
        return { success: false, message: 'No authentication token' }
      }

    
      
      const response = await axiosClient.get<ServiceResponse>("/auth/me")

      console.log('- Response status:', response.status)
      return response.data;
   // In authService.ts getMe method
} catch (error: any) {
  console.error('❌ getMe Error Details:', {
    message: error?.message || 'Unknown error',
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    data: error?.response?.data,
    name: error?.name,
  })
  
  // Return a ServiceResponse with error flag
  return {
    success: false,
    message: error?.response?.data?.message || error?.message || 'Failed to get user',
    error: true,
    data: undefined  // Explicitly set data to undefined
  } as ServiceResponse
}},

  getProfile: async () => {
    try {
      const res = await axiosClient.get<ServiceResponse>('/auth/profile')
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  logout: async () => {
    try {
      await axiosClient.post('/auth/logout')
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
    }
    return { success: true }
  },

  logoutAll: async () => {
    try {
      await axiosClient.post('/auth/logout-all')
    } finally {
      localStorage.clear()
    }
    return { success: true }
  },

  updateProfile: async (data: FormData | any) => {
    try {
      // If it's FormData, clean it up to remove empty string values
      if (data instanceof FormData) {
        const cleanedData = new FormData()
        
        // Iterate through all entries and only add non-empty values
        for (const [key, value] of data.entries()) {
          if (value instanceof File) {
            // Always add file uploads
            cleanedData.append(key, value)
          } else if (typeof value === 'string' && value.trim() !== '') {
            // Only add non-empty strings
            cleanedData.append(key, value.trim())
          } else if (typeof value !== 'string' && value !== null && value !== undefined) {
            // Add other non-null/undefined values
            cleanedData.append(key, value)
          }
        }
        
        data = cleanedData
      } else {
        // If it's a plain object, remove empty strings
        const cleanedData: any = {}
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string' && value.trim() !== '') {
            cleanedData[key] = value.trim()
          } else if (typeof value !== 'string' && value !== null && value !== undefined) {
            cleanedData[key] = value
          }
        }
        data = cleanedData
      }

      const res = await axiosClient.put<AuthResponse>('/auth/profile', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })

      return {
        success: res.data.success,
        message: res.data.message,
        data: normaliseUser(res.data.data),
      }
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const res = await axiosClient.put<AuthResponse>('/auth/change-password', data)

      if (res.data.success) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
      }

      return { success: res.data.success, message: res.data.message }
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  // -----------------------------
  // UTILITY
  // -----------------------------
  isAuthenticated: () => !!localStorage.getItem('authToken'),
  getToken: () => localStorage.getItem('authToken'),
  clearTokens: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
  },
}