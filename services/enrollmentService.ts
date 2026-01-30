// ============================================
// services/enrollmentService.ts
// ============================================

import { handleResponse, fetchWithAuth } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const enrollmentService = {
  // =====================================================
  // STUDENT
  // =====================================================

  // Get logged-in student's enrollments
  getMyEnrollments: async () => {
    const response = await fetchWithAuth(`${API_URL}/enrollments/me`);
    return handleResponse(response);
  },

  // Self-enroll in a program (if route exists)
  selfEnroll: async (programId: string) => {
    const response = await fetchWithAuth(`${API_URL}/programs/${programId}/enroll`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  // =====================================================
  // ADMIN
  // =====================================================

  // Enroll a student into a program
  enrollStudent: async (data: {
    studentId: string;
    programId: string;
    cohort?: string;
    notes?: string;
  }) => {
    const response = await fetchWithAuth(`${API_URL}/enrollments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get all enrollments (admin)
  getAllEnrollments: async (params?: {
    status?: string;
    programId?: string;
    cohort?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetchWithAuth(`${API_URL}/enrollments?${query}`);
    return handleResponse(response);
  },

  // Update enrollment status
  updateEnrollmentStatus: async (
    enrollmentId: string,
    data: {
      status?: string;
      completionDate?: string;
      dropDate?: string;
      notes?: string;
    }
  ) => {
    const response = await fetchWithAuth(`${API_URL}/enrollments/${enrollmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getEnrollmentById: async (id: string) => {
  const response = await fetchWithAuth(`${API_URL}/enrollments/${id}`);
  return handleResponse(response);
},

updateCourseProgress: async (
  enrollmentId: string,
  courseId: string,
  data: { status?: string; lessonsCompleted?: number; completionDate?: string }
) => {
  const response = await fetchWithAuth(
    `${API_URL}/enrollments/${enrollmentId}/course/${courseId}`,
    { method: 'PUT', body: JSON.stringify(data) }
  );
  return handleResponse(response);
},

getEnrollmentStats: async (programId?: string) => {
  const query = programId ? `?programId=${programId}` : '';
  const response = await fetchWithAuth(`${API_URL}/enrollments/stats/overview${query}`);
  return handleResponse(response);
},


  // Delete enrollment
  deleteEnrollment: async (enrollmentId: string) => {
    const response = await fetchWithAuth(`${API_URL}/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};
