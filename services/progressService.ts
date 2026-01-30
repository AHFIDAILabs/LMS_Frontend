// ============================================
// services/progressService.ts
// ============================================

import { fetchWithAuth, handleResponse } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const progressService = {
  // =====================================================
  // LESSON PROGRESS
  // =====================================================

  // Start a lesson
  startLesson: async (lessonId: string) => {
    const response = await fetchWithAuth(`${API_URL}/progress/lesson/${lessonId}/start`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  // Complete a lesson
  completeLesson: async (lessonId: string, timeSpent?: number) => {
    const response = await fetchWithAuth(`${API_URL}/progress/lesson/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ timeSpent }),
    });
    return handleResponse(response);
  },

  // =====================================================
  // ASSESSMENT PROGRESS
  // =====================================================

  // Start an assessment
  startAssessment: async (assessmentId: string) => {
    const response = await fetchWithAuth(`${API_URL}/progress/assessment/${assessmentId}/start`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  // Complete an assessment
  completeAssessment: async (assessmentId: string, score: number) => {
    const response = await fetchWithAuth(`${API_URL}/progress/assessment/${assessmentId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    });
    return handleResponse(response);
  },

  // =====================================================
  // COURSE PROGRESS
  // =====================================================

  // Get a student's progress for a course
  getCourseProgress: async (courseId: string) => {
    const response = await fetchWithAuth(`${API_URL}/progress/course/${courseId}`);
    return handleResponse(response);
  },

  // Get a student's progress for a program
  getProgramProgress: async (programId: string) => {
    const response = await fetchWithAuth(`${API_URL}/progress/program/${programId}`);
    return handleResponse(response);
  },

  // Get a student's progress for a module
  getModuleProgress: async (moduleId: string) => {
    const response = await fetchWithAuth(`${API_URL}/progress/module/${moduleId}`);
    return handleResponse(response);
  },
};
