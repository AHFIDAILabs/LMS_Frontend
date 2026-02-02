// ============================================
// services/programService.ts
// ============================================
import { ApiResponse } from '@/types';
import { Program, ProgramPayload } from '@/types';
import { axiosClient } from '@/lib/axiosClient';

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
      const response = await axiosClient.get('/programs', { params });

      return {
        success: true,
        data: response.data.data,
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch programs',
        data: [],
      };
    }
  },

  // ---------------------------------------------------
  // GET: program by ID
  // ---------------------------------------------------
  getProgramById: async (programId: string): Promise<ApiResponse<Program>> => {
    if (!programId) {
      return { 
        success: false, 
        error: 'Program ID is required', 
        data: null as any 
      };
    }

    try {
      const response = await axiosClient.get(`/programs/${programId}`);

      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch program',
        data: null as any,
      };
    }
  },

  // --------------------------------------------------
  // GET: PROGRAM With All Details
  // --------------------------------------------------

getProgramWithAllDetails: async (
  programId: string,
  details?: string
): Promise<ApiResponse<Program>> => {
  if (!programId) {
    return {
      success: false,
      data: null as any,
      error: 'Program ID is required',
    }
  }

  try {
    const response = await axiosClient.get(`/programs/details/${programId}`, {
      params: details ? { details } : {},
    })

    return {
      success: true,
      data: response.data.data,
      error: null as any,
    }
  } catch (error: any) {
    return {
      success: false,
      data: null as any,
      error:
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch program details',
    }
  }
},


  // ---------------------------------------------------
  // GET: program by slug
  // ---------------------------------------------------
  getProgramBySlug: async (slug: string): Promise<ApiResponse<Program>> => {
    if (!slug) {
      return { 
        success: false, 
        error: 'Program slug is required', 
        data: null as any 
      };
    }

    try {
      const response = await axiosClient.get(`/programs/slug/${slug}`);

      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch program',
        data: null as any,
      };
    }
  },

  // ---------------------------------------------------
  // CREATE: new program
  // ---------------------------------------------------
  createProgram: async (data: ProgramPayload): Promise<ApiResponse<Program>> => {
    try {
      const response = await axiosClient.post('/programs', data);

      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create program',
        data: null as any,
      };
    }
  },

  // ---------------------------------------------------
  // UPDATE: existing program
  // ---------------------------------------------------
  updateProgram: async (programId: string, data: ProgramPayload): Promise<ApiResponse<Program>> => {
    try {
      const response = await axiosClient.put(`/programs/${programId}`, data);

      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update program',
        data: null as any,
      };
    }
  },

  // ---------------------------------------------------
  // DELETE: program
  // ---------------------------------------------------
  deleteProgram: async (programId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await axiosClient.delete(`/programs/${programId}`);

      return {
        success: true,
        data: response.data.data || null,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete program',
        data: null,
      };
    }
  },

  // ---------------------------------------------------
  // TOGGLE: publish status
  // ---------------------------------------------------
  togglePublish: async (programId: string): Promise<ApiResponse<Program>> => {
    try {
      const response = await axiosClient.put(`/programs/${programId}/toggle-publish`);

      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to toggle publish status',
        data: null as any,
      };
    }
  },

  // ---------------------------------------------------
  // ADD: course to program
  // ---------------------------------------------------
  addCourse: async (programId: string, courseId: string): Promise<ApiResponse<Program>> => {
    try {
      const response = await axiosClient.post('/programs/add-course', {
        programId,
        courseId,
      });

      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to add course',
        data: null as any,
      };
    }
  },

  // ---------------------------------------------------
  // REMOVE: course from program
  // ---------------------------------------------------
  removeCourse: async (programId: string, courseId: string): Promise<ApiResponse<Program>> => {
    try {
      const response = await axiosClient.post('/programs/remove-course', {
        programId,
        courseId,
      });

      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to remove course',
        data: null as any,
      };
    }
  },
};