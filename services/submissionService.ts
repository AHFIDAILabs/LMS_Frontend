// ============================================
// services/submissionService.ts
// ============================================

import { fetchWithAuth, handleResponse } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const submissionService = {
  // =============================
  // STUDENT - SUBMISSIONS
  // =============================
  create: async (data: {
    assessmentId: string;
    answers: Array<{
      questionId: string;
      answer: string | string[];
    }>;
    courseId?: string;
    programId?: string;
  }) => {
    const response = await fetchWithAuth(`${API_URL}/submissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // For file uploads (assignments/projects)
  createWithFiles: async (formData: FormData) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const response = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return handleResponse(response);
  },

  getById: async (submissionId: string) => {
    const response = await fetchWithAuth(`${API_URL}/submissions/${submissionId}`);
    return handleResponse(response);
  },

  getMySubmissions: async (assessmentId: string) => {
    const response = await fetchWithAuth(`${API_URL}/submissions/assessments/${assessmentId}/my-submissions`);
    return handleResponse(response);
  },

  // =============================
  // ADMIN/INSTRUCTOR - GRADING
  // =============================
  admin: {
    getByAssessment: async (assessmentId: string, params?: Record<string, string | number>) => {
      const query = params ? `?${new URLSearchParams(params as any)}` : '';
      const response = await fetchWithAuth(`${API_URL}/submissions/assessments/${assessmentId}${query}`);
      return handleResponse(response);
    },

    getByStudent: async (studentId: string, params?: Record<string, string | number>) => {
      const query = params ? `?${new URLSearchParams(params as any)}` : '';
      const response = await fetchWithAuth(`${API_URL}/submissions/students/${studentId}${query}`);
      return handleResponse(response);
    },

    grade: async (submissionId: string, data: {
      score: number;
      feedback?: string;
    }) => {
      const response = await fetchWithAuth(`${API_URL}/submissions/grade/${submissionId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  },
};