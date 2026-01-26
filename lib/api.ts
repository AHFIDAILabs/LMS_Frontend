const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
import { RegisterData } from "@/types"

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || 'Request failed')
  }
  return response.json()
}

// Helper function to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }
  
  return fetch(url, { ...options, headers })
}

export const api = {
  // ============= AUTH =============
  auth: {
    register: async (data: RegisterData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },
    
    login: async (credentials: { email: string; password: string }) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      return handleResponse(response)
    },
    
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
      }
    },
    
    getCurrentUser: async () => {
      const response = await fetchWithAuth(`${API_URL}/auth/me`)
      return handleResponse(response)
    },
    
    updateProfile: async (data: FormData | any) => {
      const token = getAuthToken()
      const headers: any = {
        ...(token && { Authorization: `Bearer ${token}` }),
      }
      
      // Don't set Content-Type for FormData (browser will set it with boundary)
      if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
      }
      
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers,
        body: data instanceof FormData ? data : JSON.stringify(data),
      })
      return handleResponse(response)
    },
    
    changePassword: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetchWithAuth(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },
    
    forgotPassword: async (email: string) => {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      return handleResponse(response)
    },
    
    resetPassword: async (resetToken: string, password: string) => {
      const response = await fetch(`${API_URL}/auth/reset-password/${resetToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      return handleResponse(response)
    },
    
    refreshToken: async () => {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      return handleResponse(response)
    },
    
    logoutAll: async () => {
      const response = await fetchWithAuth(`${API_URL}/auth/logout-all`, {
        method: 'POST',
      })
      return handleResponse(response)
    },
  },

  // ============= COURSES =============
  courses: {
    getAll: async () => {
      const response = await fetchWithAuth(`${API_URL}/courses`)
      return handleResponse(response)
    },
    
    getById: async (courseId: string) => {
      const response = await fetchWithAuth(`${API_URL}/courses/${courseId}`)
      return handleResponse(response)
    },
    
    enroll: async (courseId: string) => {
      const response = await fetchWithAuth(`${API_URL}/courses/${courseId}/enroll`, {
        method: 'POST',
      })
      return handleResponse(response)
    },
  },

  // ============= MODULES =============
  modules: {
    getByCourse: async (courseId: string) => {
      const response = await fetchWithAuth(`${API_URL}/courses/${courseId}/modules`)
      return handleResponse(response)
    },
    
    getById: async (moduleId: string) => {
      const response = await fetchWithAuth(`${API_URL}/modules/${moduleId}`)
      return handleResponse(response)
    },
  },

  // ============= LESSONS =============
  lessons: {
    getByModule: async (moduleId: string) => {
      const response = await fetchWithAuth(`${API_URL}/modules/${moduleId}/lessons`)
      return handleResponse(response)
    },
    
    getById: async (lessonId: string) => {
      const response = await fetchWithAuth(`${API_URL}/lessons/${lessonId}`)
      return handleResponse(response)
    },
    
    markAsComplete: async (lessonId: string) => {
      const response = await fetchWithAuth(`${API_URL}/lessons/${lessonId}/complete`, {
        method: 'POST',
      })
      return handleResponse(response)
    },
  },

  // ============= QUIZZES =============
  quizzes: {
    getById: async (quizId: string) => {
      const response = await fetchWithAuth(`${API_URL}/quizzes/${quizId}`)
      return handleResponse(response)
    },
    
    submit: async (quizId: string, answers: Record<string, any>) => {
      const response = await fetchWithAuth(`${API_URL}/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      })
      return handleResponse(response)
    },
    
    getResults: async (quizId: string) => {
      const response = await fetchWithAuth(`${API_URL}/quizzes/${quizId}/results`)
      return handleResponse(response)
    },
  },

  // ============= PROGRESS =============
  progress: {
    getOverview: async () => {
      const response = await fetchWithAuth(`${API_URL}/progress`)
      return handleResponse(response)
    },
    
    getByCourse: async (courseId: string) => {
      const response = await fetchWithAuth(`${API_URL}/progress/course/${courseId}`)
      return handleResponse(response)
    },
  },

  // ============= CERTIFICATES =============
  certificates: {
    get: async (courseId: string) => {
      const response = await fetchWithAuth(`${API_URL}/certificates/${courseId}`)
      return handleResponse(response)
    },
    
    download: async (courseId: string) => {
      const response = await fetchWithAuth(`${API_URL}/certificates/${courseId}/download`)
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${courseId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    },
  },

  // ============= ADMIN =============
  admin: {
    // Courses
    createCourse: async (data: any) => {
      const response = await fetchWithAuth(`${API_URL}/admin/courses`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },
    
    updateCourse: async (courseId: string, data: any) => {
      const response = await fetchWithAuth(`${API_URL}/admin/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },
    
    deleteCourse: async (courseId: string) => {
      const response = await fetchWithAuth(`${API_URL}/admin/courses/${courseId}`, {
        method: 'DELETE',
      })
      return handleResponse(response)
    },
    
    // Modules
    createModule: async (courseId: string, data: any) => {
      const response = await fetchWithAuth(`${API_URL}/admin/courses/${courseId}/modules`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },
    
    // Lessons
    createLesson: async (moduleId: string, data: any) => {
      const response = await fetchWithAuth(`${API_URL}/admin/modules/${moduleId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },
    
    // Students
    getStudents: async () => {
      const response = await fetchWithAuth(`${API_URL}/admin/students`)
      return handleResponse(response)
    },
    
    getStudentProgress: async (studentId: string) => {
      const response = await fetchWithAuth(`${API_URL}/admin/students/${studentId}/progress`)
      return handleResponse(response)
    },
    
    // Analytics
    getAnalytics: async () => {
      const response = await fetchWithAuth(`${API_URL}/admin/analytics`)
      return handleResponse(response)
    },
  },
}

export default api