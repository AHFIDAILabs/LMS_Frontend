// hooks/useAssessment.ts
import { assessmentService } from '@/services/assessmentService'
import { useFetch } from './useFetch'
import { IAssessment } from '../types/assessments'

// ==============================
// STUDENT - FETCH ASSESSMENTS
// ==============================

/**
 * Fetch all published assessments (for students)
 * Maps to: GET /assessments/published
 */
export const usePublishedAssessments = (params?: Record<string, string | number>) => {
  return useFetch<IAssessment[]>(async () => {
    const res = await assessmentService.getPublished(params)
    return res.data
  }, [JSON.stringify(params)])
}

/**
 * Fetch single assessment by ID
 * Maps to: GET /assessments/:id
 */
export const useAssessmentById = (assessmentId: string) => {
  return useFetch<IAssessment>(async () => {
    const res = await assessmentService.getById(assessmentId)
    return res.data
  }, [assessmentId])
}

/**
 * Fetch assessments by course
 * Maps to: GET /assessments/course/:courseId
 */
export const useAssessmentsByCourse = (courseId: string) => {
  return useFetch<IAssessment[]>(async () => {
    const res = await assessmentService.getByCourse(courseId)
    return res.data
  }, [courseId])
}

/**
 * Fetch assessments by module
 * Maps to: GET /assessments/module/:moduleId
 */
export const useAssessmentsByModule = (moduleId: string) => {
  return useFetch<IAssessment[]>(async () => {
    const res = await assessmentService.getByModule(moduleId)
    return res.data
  }, [moduleId])
}

// ==============================
// ADMIN/INSTRUCTOR - FETCH ALL
// ==============================

/**
 * Fetch all assessments (admin/instructor only)
 * Maps to: GET /assessments/admin/all
 */
export const useAllAssessmentsAdmin = (params?: Record<string, string | number>) => {
  return useFetch<IAssessment[]>(async () => {
    const res = await assessmentService.admin.getAll(params)
    return res.data
  }, [JSON.stringify(params)])
}

// ==============================
// ADMIN/INSTRUCTOR - MUTATIONS
// ==============================

/**
 * Create new assessment
 * Maps to: POST /assessments/admin
 */
export const useCreateAssessment = () => {
  return async (data: Parameters<typeof assessmentService.admin.create>[0]) => {
    const res = await assessmentService.admin.create(data)
    return res.data
  }
}

/**
 * Update existing assessment
 * Maps to: PUT /assessments/admin/:id
 */
export const useUpdateAssessment = () => {
  return async (id: string, data: Partial<IAssessment>) => {
    const res = await assessmentService.admin.update(id, data)
    return res.data
  }
}

/**
 * Delete assessment
 * Maps to: DELETE /assessments/admin/:id
 */
export const useDeleteAssessment = () => {
  return async (id: string) => {
    const res = await assessmentService.admin.delete(id)
    return res.data
  }
}

/**
 * Toggle assessment publish status
 * Maps to: PATCH /assessments/admin/:id/publish
 */
export const useTogglePublish = () => {
  return async (id: string) => {
    const res = await assessmentService.admin.togglePublish(id)
    return res.data
  }
}

/**
 * Reorder assessments
 * Maps to: PATCH /assessments/admin/reorder
 */
export const useReorderAssessments = () => {
  return async (orders: Array<{ assessmentId: string; order: number }>) => {
    const res = await assessmentService.admin.reorder(orders)
    return res.data
  }
}

/**
 * Send assessment reminder to students
 * Maps to: POST /assessments/admin/:id/reminder
 */
export const useSendAssessmentReminder = () => {
  return async (id: string) => {
    const res = await assessmentService.admin.sendReminder(id)
    return res.data
  }
}