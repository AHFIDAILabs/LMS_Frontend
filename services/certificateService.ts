// ============================================
// services/certificateService.ts
// ============================================

import { fetchWithAuth, handleResponse } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const certificateService = {
  // =============================
  // STUDENT - MY CERTIFICATES
  // =============================
  getMyCertificates: async () => {
    const response = await fetchWithAuth(`${API_URL}/certificates/me`);
    return handleResponse(response);
  },

  getById: async (certificateId: string) => {
    const response = await fetchWithAuth(`${API_URL}/certificates/${certificateId}`);
    return handleResponse(response);
  },

  download: async (certificateId: string) => {
    const response = await fetchWithAuth(`${API_URL}/certificates/${certificateId}/download`);
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  verify: async (certificateId: string) => {
    const response = await fetchWithAuth(`${API_URL}/certificates/${certificateId}/verify`);
    return handleResponse(response);
  },

  // =============================
  // ADMIN/INSTRUCTOR - MANAGE
  // =============================
  admin: {
    getAll: async (params?: Record<string, string | number>) => {
      const query = params ? `?${new URLSearchParams(params as any)}` : '';
      const response = await fetchWithAuth(`${API_URL}/certificates${query}`);
      return handleResponse(response);
    },

    issue: async (data: {
      studentId: string;
      courseId?: string;
      programId?: string;
      grade?: string;
      finalScore?: number;
      pdfUrl?: string;
    }) => {
      const response = await fetchWithAuth(`${API_URL}/certificates/issue`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    revoke: async (certificateId: string) => {
      const response = await fetchWithAuth(`${API_URL}/certificates/revoke/${certificateId}`, {
        method: 'POST',
      });
      return handleResponse(response);
    },

    getByStudent: async (studentId: string) => {
      const response = await fetchWithAuth(`${API_URL}/certificates/student/${studentId}`);
      return handleResponse(response);
    },

    getByCourse: async (courseId: string) => {
      const response = await fetchWithAuth(`${API_URL}/certificates/course/${courseId}`);
      return handleResponse(response);
    },

    getByProgram: async (programId: string) => {
      const response = await fetchWithAuth(`${API_URL}/certificates/program/${programId}`);
      return handleResponse(response);
    },
  },
};