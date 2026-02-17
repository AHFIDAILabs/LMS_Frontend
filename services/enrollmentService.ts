// ============================================
// services/enrollmentService.ts
// ============================================
import { axiosClient } from '@/lib/axiosClient'

export interface EnrollmentParams {
  status?: string
  programId?: string
  cohort?: string
  page?: number
  limit?: number
}

export interface EnrollStudentData {
  studentId: string
  programId: string
  cohort?: string
  notes?: string
}

export interface SelfEnrollData {
  scholarshipCode?: string
  paymentMethod?: string
}

export interface ValidateScholarshipData {
  code: string
  programId: string
}

export interface UpdateEnrollmentData {
  status?: string
  completionDate?: string
  dropDate?: string
  notes?: string
}

export interface UpdateCourseProgressData {
  status?: string
  lessonsCompleted?: number
  completionDate?: string
}

export const enrollmentService = {
  // =====================================================
  // STUDENT ENDPOINTS
  // =====================================================

  /**
   * Get logged-in student's enrollments
   */
  getMyEnrollments: async () => {
    try {
      const response = await axiosClient.get('/enrollments/me')
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  },

  /**
   * Self-enroll in a program
   */
selfEnroll: async (programId: string, data?: SelfEnrollData) => {
    try {
      const response = await axiosClient.post(`/programs/${programId}/enroll`, data || {})
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  },


  /**
   * Validate scholarship code before enrollment
   */
  validateScholarship: async (data: ValidateScholarshipData) => {
    try {
      const response = await axiosClient.post('/enrollments/validate-scholarship', data)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  },

  // =====================================================
  // ADMIN ENDPOINTS
  // =====================================================

  /**
   * Enroll a student into a program (Admin)
   */
  enrollStudent: async (data: EnrollStudentData) => {
    try {
      const response = await axiosClient.post('/enrollments', data)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  },

  /**
   * Get all enrollments with filters (Admin)
   */
  getAllEnrollments: async (params?: EnrollmentParams) => {
    try {
      const response = await axiosClient.get('/enrollments', { params })
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
        error: error.message,
        data: null,
      }
    }
  },

  /**
   * Get single enrollment by ID
   */
  getEnrollmentById: async (enrollmentId: string) => {
    try {
      const response = await axiosClient.get(`/enrollments/${enrollmentId}`)
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  },

  /**
   * Update enrollment status (Admin)
   */
 updateEnrollmentStatus: async (
    enrollmentId: string,
    data: UpdateEnrollmentData
  ) => {
    try {
      const response = await axiosClient.put(`/enrollments/${enrollmentId}`, data)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  },


  /**
   * Update course progress within enrollment
   */
 updateCourseProgress: async (
    enrollmentId: string,
    courseId: string,
    data: UpdateCourseProgressData
  ) => {
    try {
      const response = await axiosClient.put(
        `/enrollments/${enrollmentId}/course/${courseId}`,
        data
      )
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  },

  /**
   * Get enrollment statistics
   */
getEnrollmentStats: async (programId?: string, courseId?: string) => {
  try {
    const params = new URLSearchParams();
    
    // ✅ Only add params if they're actually defined and not null/undefined
    if (programId && programId !== 'undefined' && programId !== 'null') {
      params.append('programId', programId);
      console.log('📊 Fetching stats for programId:', programId);
    }
    
    if (courseId && courseId !== 'undefined' && courseId !== 'null') {
      params.append('courseId', courseId);
      console.log('📊 Fetching stats for courseId:', courseId);
    }
    
    // ✅ Add timestamp to bypass cache
    params.append('_t', Date.now().toString());
    
    const queryString = params.toString();
    const url = `/enrollments/stats/overview${queryString ? `?${queryString}` : ''}`;
    
    console.log('📊 Requesting stats from:', url);
    
    const { data } = await axiosClient.get(url);
    
    console.log('✅ Stats response:', data);
    
    return data;
  } catch (error: any) {
    console.error('❌ Failed to fetch enrollment stats:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch stats',
      data: null
    };
  }
},

   /**
   * Bulk enroll students in a program (Admin)
   */
  bulkEnrollStudents: async (data: {
    studentIds: string[]
    programId: string
    cohort?: string
    notes?: string
  }) => {
    try {
      const response = await axiosClient.post('/enrollments/bulk', data)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  },

  /**
   * Get available students for enrollment
   */
  getAvailableStudents: async (params?: {
    programId?: string
    search?: string
    limit?: number
  }) => {
    try {
      const response = await axiosClient.get('/enrollments/available-students', { params })
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  },

   /**
   * Bulk enroll by email (creates users if they don't exist)
   */
  bulkEnrollByEmail: async (data: {
    emails: Array<string | {
      email: string
      firstName?: string
      lastName?: string
      cohort?: string
    }>
    programId: string
    cohort?: string
    notes?: string
    createUsers?: boolean
  }) => {
    try {
      const response = await axiosClient.post('/enrollments/bulk-email', data)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: null,
      }
    }
  },

  /**
   * Delete enrollment (Admin)
   */
  deleteEnrollment: async (enrollmentId: string) => {
    try {
      const response = await axiosClient.delete(`/enrollments/${enrollmentId}`)
      return {
        success: true,
        message: response.data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  },
}