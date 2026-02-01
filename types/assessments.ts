// types/assessment.ts

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

  // References
  programId?: string; // Added to match backend model
  courseId: string | { _id: string; title: string };
  moduleId?: string | { _id: string; title: string };
  lessonId?: string | { _id: string; title: string };

  // Basic Info
  title: string;
  description: string;
  type: AssessmentType;

  // Questions & Scoring
  questions: IQuestion[];
  totalPoints: number; // Always calculated by backend, not optional
  passingScore: number;

  // Settings
  duration?: number; // in minutes
  attempts: number; // Default is 2 from backend controller
  isPublished: boolean;
  isRequiredForCompletion: boolean; // Has default true, not optional

  // Ordering
  order: number;

  // Dates
  startDate?: string; // ISO string
  endDate?: string; // ISO string

  // Timestamps
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// For populated responses
export interface IAssessmentPopulated extends Omit<IAssessment, 'courseId' | 'moduleId' | 'lessonId'> {
  courseId: { _id: string; title: string };
  moduleId?: { _id: string; title: string };
  lessonId?: { _id: string; title: string };
}

// For creation
export interface ICreateAssessment {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description: string;
  type: AssessmentType;
  questions: IQuestion[];
  passingScore: number;
  duration?: number;
  order?: number;
  startDate?: Date | string;
  endDate?: Date | string;
}

// For updates
export interface IUpdateAssessment extends Partial<ICreateAssessment> {}

// For reordering
export interface IReorderAssessment {
  assessmentId: string;
  order: number;
}