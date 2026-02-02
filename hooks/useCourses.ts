// ============================================
// hooks/useCourses.ts
// ============================================

import { useState, useCallback } from 'react';
import { courseService } from '@/services/courseService';
import { ApiResponse } from '@/types';

export const useCourses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

// hooks/useCourses.ts — replace getMyCourses

const getMyCourses = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
   
    // and returns the raw data array on success — not an ApiResponse
    const data = await courseService.getMyCourses();
    return data;
  } catch (err: any) {
    setError(err.message || 'Failed to fetch your courses');
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  const getCourseById = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.getCourseById(courseId) as ApiResponse<any>;
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch course');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllCourses = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.getAllCourses(params) as ApiResponse<any>;
      if (response.success) {
        return response;
      }
      throw new Error(response.message || 'Failed to fetch courses');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const enrollInCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.enrollInCourse(courseId) as ApiResponse<any>;
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to enroll in course');
    } catch (err: any) {
      setError(err.message || 'Failed to enroll in course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getMyCourses,
    getCourseById,
    getAllCourses,
    enrollInCourse,
  };
};