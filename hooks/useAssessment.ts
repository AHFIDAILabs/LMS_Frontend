// hooks/useAssessment.ts
import { assessmentService } from '@/services/assessmentService';
import { useFetch } from './useFetch';
import { IAssessment } from '../types/assessments';

// ==============================
// STUDENT - FETCH ASSESSMENTS
// ==============================
export const useAllAssessments = (params?: Record<string, string | number>) => {
  return useFetch<IAssessment[]>(() => assessmentService.getAll(params) as Promise<IAssessment[]>, [
    JSON.stringify(params),
  ]);
};

export const usePublishedAssessments = (params?: Record<string, string | number>) => {
  return useFetch<IAssessment[]>(() => assessmentService.getAll(params) as Promise<IAssessment[]>, [
    JSON.stringify(params),
  ]);
};

export const useAssessmentById = (assessmentId: string) => {
  return useFetch<IAssessment>(() => assessmentService.getById(assessmentId) as Promise<IAssessment>, [
    assessmentId,
  ]);
};

export const useAssessmentsByCourse = (courseId: string) => {
  return useFetch<IAssessment[]>(() => assessmentService.getByCourse(courseId) as Promise<IAssessment[]>, [
    courseId,
  ]);
};

export const useAssessmentsByModule = (moduleId: string) => {
  return useFetch<IAssessment[]>(() => assessmentService.getByModule(moduleId) as Promise<IAssessment[]>, [
    moduleId,
  ]);
};

// ==============================
// ADMIN/INSTRUCTOR - MUTATIONS
// ==============================
export const useCreateAssessment = () => {
  return async (data: Parameters<typeof assessmentService.admin.create>[0]) => {
    return assessmentService.admin.create(data);
  };
};

export const useUpdateAssessment = () => {
  return async (id: string, data: any) => {
    return assessmentService.admin.update(id, data);
  };
};

export const useDeleteAssessment = () => {
  return async (id: string) => {
    return assessmentService.admin.delete(id);
  };
};

export const useTogglePublish = () => {
  return async (id: string) => {
    return assessmentService.admin.togglePublish(id);
  };
};

export const useReorderAssessments = () => {
  return async (orders: Array<{ assessmentId: string; order: number }>) => {
    return assessmentService.admin.reorder(orders);
  };
};

export const useSendAssessmentReminder = () => {
  return async (id: string) => {
    return assessmentService.admin.sendReminder(id);
  };
};
