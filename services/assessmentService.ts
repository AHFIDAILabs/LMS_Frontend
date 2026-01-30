// ============================================
// services/assessmentService.ts
// ============================================

import { fetchWithAuth, handleResponse } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const assessmentService = {
  // =============================
  // STUDENT - ASSESSMENTS
  // =============================
  getAll: async (params?: Record<string, string | number>) => {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    const response = await fetchWithAuth(`${API_URL}/assessments${query}`);
    return handleResponse(response);
  },

  getById: async (assessmentId: string) => {
    const response = await fetchWithAuth(`${API_URL}/assessments/${assessmentId}`);
    return handleResponse(response);
  },

  getByCourse: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/assessments/courses/${courseId}`);
    return handleResponse(response);
  },

  getByModule: async (moduleId: string) => {
    const response = await fetchWithAuth(`${API_URL}/assessments/modules/${moduleId}`);
    return handleResponse(response);
  },

  // =============================
  // ADMIN/INSTRUCTOR - MANAGE
  // =============================
  admin: {
    getAll: async (params?: Record<string, string | number>) => {
      const query = params ? `?${new URLSearchParams(params as any)}` : '';
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/all${query}`);
      return handleResponse(response);
    },

    create: async (data: {
      courseId: string;
      moduleId?: string;
      lessonId?: string;
      title: string;
      description: string;
      type: 'quiz' | 'assignment' | 'project' | 'capstone';
      questions: any[];
      passingScore: number;
      duration?: number;
      attempts?: number;
      order?: number;
      startDate?: Date;
      endDate?: Date;
    }) => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    update: async (assessmentId: string, data: any) => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/${assessmentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    delete: async (assessmentId: string) => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/${assessmentId}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    },

    togglePublish: async (assessmentId: string) => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/${assessmentId}/publish`, {
        method: 'PATCH',
      });
      return handleResponse(response);
    },

    reorder: async (orders: Array<{ assessmentId: string; order: number }>) => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ orders }),
      });
      return handleResponse(response);
    },

    sendReminder: async (assessmentId: string) => {
      const response = await fetchWithAuth(`${API_URL}/assessments/admin/${assessmentId}/reminder`, {
        method: 'POST',
      });
      return handleResponse(response);
    },
  },
};
