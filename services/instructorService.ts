import { ApiResponse } from '@/types'
import { axiosClient } from '@/lib/axiosClient'

// =============================
// Error helper (same pattern)
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
      // Clean FormData to remove empty values
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
  createCourse: async (
    data: FormData | Record<string, any>
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosClient.post(
        '/instructors/courses',
        data,
        {
          headers:
            data instanceof FormData
              ? { 'Content-Type': 'multipart/form-data' }
              : {},
        }
      )
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
    page?: number
    limit?: number
  }) => {
    try {
      const res = await axiosClient.get('/instructors/students', { params })
      return res.data
    } catch (err) {
      throw new Error(extractError(err))
    }
  },

  // Get detailed progress for a specific student in a course
   
  getStudentProgress: async (studentId: string, courseId: string) => {
    try {
      console.log(`Fetching progress for student ${studentId} in course ${courseId}`)
      const res = await axiosClient.get(
        `/instructors/students/${studentId}/courses/${courseId}/progress`
      )
      console.log('Student progress response:', res.data)
      return res.data
    } catch (err) {
      console.error('Error fetching student progress:', err)
      throw new Error(extractError(err))
    }
  },


  getInstructorModules: async () => {
  try{
        const res = await axiosClient.get("/instructors/content/modules");
        return res.data;

  } catch (err){
    console.error("Error fetching Instructor Modules", err)
    throw new Error(extractError(err))


  }

},

getInstructorLessons: async () => {
 try{
   const res = await axiosClient.get("/instructors/content/lessons");
  return res.data;
 } catch (err){
  console.error("Error fetching Instructor Lessons", err)
  throw new Error(extractError(err))  
}},

getInstructorAssessments: async () => {
    try{
      const res = await axiosClient.get("/instructors/content/assessments");
      return res.data;
    } catch (err){
      console.error("Error fetching Instructor Assessments", err)
      throw new Error(extractError(err))
    }
},  



  // =========================
  // ASSESSMENTS & SUBMISSIONS
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

  // =========================
  // ANNOUNCEMENTS
  // =========================
  sendAnnouncement: async (courseId: string, title: string, message: string) => {
    try {
      const res = await axiosClient.post(
        `/instructors/courses/${courseId}/announcements`,
        { title, message }
      )
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