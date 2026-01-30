// ============================================
// services/moduleService.ts
// ============================================

import { fetchWithAuth, handleResponse } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const moduleService = {
  // =====================================================
  // PUBLIC (Students)
  // =====================================================

  // Get all published modules for a course
  getModulesByCourse: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/modules/course/${courseId}`);
    return handleResponse(response);
  },

  // Get single module (with lessons + stats)
  getModuleById: async (moduleId: string) => {
    const response = await fetchWithAuth(`${API_URL}/modules/${moduleId}`);
    return handleResponse(response);
  },

  // =====================================================
  // ADMIN / INSTRUCTOR
  // =====================================================

  // Create module
  createModule: async (data: {
    course: string;
    title: string;
    description: string;
    order?: number;
    learningObjectives?: string[];
    sequenceLabel?: string;
    estimatedMinutes?: number;
    type?: string;
  }) => {
    const response = await fetchWithAuth(`${API_URL}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update module
  updateModule: async (moduleId: string, data: any) => {
    const response = await fetchWithAuth(`${API_URL}/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete module
  deleteModule: async (moduleId: string) => {
    const response = await fetchWithAuth(`${API_URL}/modules/${moduleId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Publish / Unpublish module (Admin only)
  togglePublish: async (moduleId: string) => {
    const response = await fetchWithAuth(`${API_URL}/modules/${moduleId}/publish`, {
      method: 'PATCH',
    });
    return handleResponse(response);
  },

  // Reorder modules
  reorderModules: async (orders: { moduleId: string; order: number }[]) => {
    const response = await fetchWithAuth(`${API_URL}/modules/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ orders }),
    });
    return handleResponse(response);
  },


  getModuleStats: async (courseId?: string) => {
  const query = courseId ? `?courseId=${courseId}` : '';
  const response = await fetchWithAuth(`${API_URL}/modules/stats/overview${query}`);
  return handleResponse(response);
},

getModuleContent: async (moduleId: string) => {
  const response = await fetchWithAuth(`${API_URL}/modules/${moduleId}/content`);
  return handleResponse(response);
},


  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  // Get all modules (admin)
  getAllModulesAdmin: async (params?: {
    page?: number;
    limit?: number;
    courseId?: string;
    type?: string;
    isPublished?: boolean;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetchWithAuth(`${API_URL}/modules?${query}`);
    return handleResponse(response);
  },
};
