// ============================================
// hooks/useProgress.ts
// ============================================

import { useState, useCallback } from 'react';
import { progressService } from '@/services/progressService';
import { ApiResponse, Progress } from '@/types';


export const useProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCourseProgress = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.getCourseProgress(courseId) as ApiResponse<any>;
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course progress');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProgramProgress = useCallback(async (programId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.getProgramProgress(programId) as ApiResponse<any>;
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch program progress');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getModuleProgress = useCallback(async (moduleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.getModuleProgress(moduleId) as ApiResponse<any>;
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch module progress');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startLesson = useCallback(async (lessonId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.startLesson(lessonId) as ApiResponse<any>;
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to start lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeLesson = useCallback(async (lessonId: string, timeSpent?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.completeLesson(lessonId, timeSpent) as ApiResponse<any>;
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to complete lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startAssessment = useCallback(async (assessmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.startAssessment(assessmentId) as ApiResponse<any>;
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to start assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeAssessment = useCallback(async (assessmentId: string, score: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.completeAssessment(assessmentId, score) as ApiResponse<any>;
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to complete assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getCourseProgress,
    getProgramProgress,
    getModuleProgress,
    startLesson,
    completeLesson,
    startAssessment,
    completeAssessment,
  };
};