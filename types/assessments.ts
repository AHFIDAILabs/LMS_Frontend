// ============================================
// types/assessment.ts
// ============================================

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  CODING = 'coding',
  ESSAY = 'essay',
}

export enum AssessmentType {
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  PROJECT = 'project',
  CAPSTONE = 'capstone',
}

export interface IQuestion {
  questionText: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  codeTemplate?: string;
}

export interface IAssessment {
  _id: string;

  programId?: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;

  title: string;
  description: string;
  type: AssessmentType;

  questions: IQuestion[];
  totalPoints: number;
  passingScore: number;

  duration?: number;
  attempts: number;
  isPublished: boolean;
  isRequiredForCompletion: boolean;

  order: number;

  startDate?: string; // ISO string
  endDate?: string; // ISO string

  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
