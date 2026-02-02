// ============================================
// services/programService.ts
// ============================================
import { ApiResponse } from '@/types';
import { getAuthToken, handleResponse } from '../lib/utils';
import { Program, ProgramPayload } from '@/types';
import { axiosClient } from '@/lib/axiosClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<any>>();

// Helper to make fetch with optional auth
async function fetchPrograms(url: string, options: RequestInit = {}) {
  if (typeof window === 'undefined') {
    throw new Error('Program service can only be used on client side');
  }

  if (ongoingRequests.has(url)) {
    return ongoingRequests.get(url)!;
  }

  const token = getAuthToken();
  const headers: any = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const requestPromise = fetch(url, { ...options, headers }).finally(() => {
    ongoingRequests.delete(url);
  });

  ongoingRequests.set(url, requestPromise);
  return requestPromise;
}

export const programService = {
  // ---------------------------------------------------
  // GET: all programs
  // ---------------------------------------------------
 getPrograms: async (params?: {
  page?: number
  limit?: number
  isPublished?: boolean
  instructorId?: string
  category?: string
  tags?: string[]
}): Promise<ApiResponse<Program[]>> => {
  try {
    const response = await axiosClient.get('/programs', { params })

    return {
      success: true,
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      pages: response.data.pages,
      error: undefined,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch programs',
      data: [],
    }
  }
},

  // ---------------------------------------------------
  // GET: program by ID
  // ---------------------------------------------------
  getProgramById: async (programId: string): Promise<ApiResponse<Program>> => {
    if (!programId) return { success: false, error: 'Program ID is required', data: null as any };
    try {
      const url = `${API_URL}/programs/details/${programId}`;
      const response = await fetchPrograms(url);
      return handleResponse<Program>(response);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch program', data: null as any };
    }
  },

  // ---------------------------------------------------
  // GET: program by slug
  // ---------------------------------------------------
  getProgramBySlug: async (slug: string): Promise<ApiResponse<Program>> => {
    if (!slug) return { success: false, error: 'Program slug is required', data: null as any };
    try {
      const url = `${API_URL}/programs/slug/${slug}`;
      const response = await fetchPrograms(url);
      return handleResponse<Program>(response);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch program', data: null as any };
    }
  },

  // ---------------------------------------------------
  // CREATE / UPDATE / DELETE
  // ---------------------------------------------------
  createProgram: async (data: ProgramPayload): Promise<ApiResponse<Program>> => {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Authentication required', data: null as any };
    try {
      const response = await fetch(`${API_URL}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      return handleResponse<Program>(response);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create program', data: null as any };
    }
  },

  updateProgram: async (programId: string, data: ProgramPayload): Promise<ApiResponse<Program>> => {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Authentication required', data: null as any };
    try {
      const response = await fetch(`${API_URL}/programs/${programId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      return handleResponse<Program>(response);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update program', data: null as any };
    }
  },

  deleteProgram: async (programId: string): Promise<ApiResponse<null>> => {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Authentication required', data: null };
    try {
      const response = await fetch(`${API_URL}/programs/${programId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      return handleResponse<null>(response);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete program', data: null };
    }
  },

  // ---------------------------------------------------
  // TOGGLE / ADD / REMOVE COURSE
  // ---------------------------------------------------
  togglePublish: async (programId: string): Promise<ApiResponse<Program>> => {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Authentication required', data: null as any };
    try {
      const response = await fetch(`${API_URL}/programs/${programId}/toggle-publish`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      return handleResponse<Program>(response);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to toggle publish status', data: null as any };
    }
  },

  addCourse: async (programId: string, courseId: string): Promise<ApiResponse<Program>> => {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Authentication required', data: null as any };
    try {
      const response = await fetch(`${API_URL}/programs/add-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ programId, courseId }),
      });
      return handleResponse<Program>(response);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add course', data: null as any };
    }
  },

  removeCourse: async (programId: string, courseId: string): Promise<ApiResponse<Program>> => {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'Authentication required', data: null as any };
    try {
      const response = await fetch(`${API_URL}/programs/remove-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ programId, courseId }),
      });
      return handleResponse<Program>(response);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to remove course', data: null as any };
    }
  },
};
