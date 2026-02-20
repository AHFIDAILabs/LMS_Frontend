// services/assessmentService.ts
import { fetchWithAuth, handleResponse } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Response type interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export const assessmentService = {
  // =============================
  // STUDENT - ASSESSMENTS
  // =============================
  
  /**
   * Get published assessments (students)
   * Backend route: getPublishedAssessments
   * Endpoint: GET /assessments/
   */
  getPublished: async (params?: Record<string, string | number>): Promise<ApiResponse<any[]>> => {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    const response = await fetchWithAuth(`${API_URL}/assessments${query}`);
    return handleResponse(response) as Promise<ApiResponse<any[]>>;
  },

  /**
   * Get single assessment by ID
   * Backend route: getAssessmentById
   * Endpoint: GET /assessments/:id
   */
  getById: async (assessmentId: string | undefined): Promise<ApiResponse<any>> => {
    const response = await fetchWithAuth(`${API_URL}/assessments/${assessmentId}`);
    return handleResponse(response) as Promise<ApiResponse<any>>;
  },

  /**
   * Get assessments by course
   * Backend route: getAssessmentsByCourse
   * Endpoint: GET /assessments/courses/:courseId
   */
  getByCourse: async (courseId: string): Promise<ApiResponse<any[]>> => {
    const response = await fetchWithAuth(`${API_URL}/assessments/courses/${courseId}`);
    return handleResponse(response) as Promise<ApiResponse<any[]>>;
  },

  /**
   * Get assessments by module
   * Backend route: getAssessmentsByModule
   * Endpoint: GET /assessments/modules/:moduleId
   */
  getByModule: async (moduleId: string): Promise<ApiResponse<any[]>> => {
    const response = await fetchWithAuth(`${API_URL}/assessments/modules/${moduleId}`);
    return handleResponse(response) as Promise<ApiResponse<any[]>>;
  },

  // =============================
  // ADMIN/INSTRUCTOR - MANAGE
  // =============================
  admin: {
    /**
     * Get all assessments (admin)
     * Backend route: getAllAssessmentsAdmin
     * Endpoint: GET /assessments/admin/all
     */
    getAll: async (params?: Record<string, string | number>): Promise<ApiResponse<any[]>> => {
      const query = params ? `?${new URLSearchParams(params as any)}` : '';
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/all${query}`);
      return handleResponse(response) as Promise<ApiResponse<any[]>>;
    },

    /**
     * Create new assessment
     * Backend route: createAssessment
     * Endpoint: POST /assessments/admin
     */
    create: async (data: {
      courseId: string;
      moduleId?: string;
      lessonId?: string;
      title: string;
      description: string;
      type: 'quiz' | 'assignment' | 'project' | 'capstone';
      questions: Array<{
        questionText: string;
        type: 'multiple_choice' | 'true_false' | 'short_answer' | 'coding' | 'essay';
        options?: string[];
        correctAnswer?: string | string[];
        points: number;
        explanation?: string;
        codeTemplate?: string;
      }>;
      passingScore: number;
      duration?: number;
      order?: number;
      startDate?: Date | string;
      endDate?: Date | string;
    }): Promise<ApiResponse<any>> => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return handleResponse(response) as Promise<ApiResponse<any>>;
    },

    /**
     * Update assessment
     * Backend route: updateAssessment
     * Endpoint: PUT /assessments/admin/:id
     */
    update: async (assessmentId: string, data: any): Promise<ApiResponse<any>> => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/${assessmentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return handleResponse(response) as Promise<ApiResponse<any>>;
    },

    /**
     * Delete assessment
     * Backend route: deleteAssessment
     * Endpoint: DELETE /assessments/admin/:id
     */
    delete: async (assessmentId: string | undefined): Promise<ApiResponse<{ message: string }>> => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/${assessmentId}`, {
        method: 'DELETE',
      });
      return handleResponse(response) as Promise<ApiResponse<{ message: string }>>;
    },

    /**
     * Toggle publish status
     * Backend route: toggleAssessmentPublish
     * Endpoint: PATCH /assessments/admin/:id/publish
     */
    togglePublish: async (assessmentId: string | undefined): Promise<ApiResponse<any>> => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/${assessmentId}/publish`, {
        method: 'PATCH',
      });
      return handleResponse(response) as Promise<ApiResponse<any>>;
    },

    /**
     * Reorder assessments
     * Backend route: reorderAssessments
     * Endpoint: PATCH /assessments/admin/reorder
     */
    reorder: async (orders: Array<{ assessmentId: string | undefined; order: number }>): Promise<ApiResponse<{ message: string }>> => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ orders }),
      });
      return handleResponse(response) as Promise<ApiResponse<{ message: string }>>;
    },

    /**
     * Send assessment reminder
     * Backend route: sendAssessmentReminder
     * Endpoint: POST /assessments/admin/:assessmentId/reminder
     */
    sendReminder: async (assessmentId: string | undefined): Promise<ApiResponse<{ message: string; count: number }>> => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/${assessmentId}/reminder`, {
        method: 'POST',
      });
      return handleResponse(response) as Promise<ApiResponse<{ message: string; count: number }>>;
    },
  },
};