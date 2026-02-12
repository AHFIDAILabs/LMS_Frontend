// types/assessments.ts

// ⚠️ IMPORTANT: These enums must match backend exactly
export enum AssessmentType {
  QUIZ = "quiz",
  ASSIGNMENT = "assignment",
  PROJECT = "project",
  CAPSTONE = "capstone",
}

// ⚠️ Backend uses underscores, not dashes
export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
  SHORT_ANSWER = "short_answer",
  ESSAY = "essay",
  CODING = "coding",
}

export interface IQuestion {
  questionText: string;
  type: QuestionType;
  points: number;
  options?: string[];
  correctAnswer?: string | string[]; // Can be string or array per backend
  explanation?: string;
  codeTemplate?: string;
}

// For creation (matches backend controller expectations)
export interface ICreateAssessment {
  programId?: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description: string;
  type: AssessmentType;
  questions: IQuestion[];
  passingScore: number;
  duration?: number; // in minutes
  attempts?: number; // Default is 2 in backend
  isPublished?: boolean; // Default is false in backend
  isRequiredForCompletion?: boolean; // Default is true in backend
  order?: number;
  startDate?: Date | string;
  endDate?: Date | string;
}

// Full assessment (matches backend model)
export interface IAssessment {
  _id: string;

  // References
  programId?: string;
  courseId: string | { _id: string; title: string };
  moduleId?: string | { _id: string; title: string };
  lessonId?: string | { _id: string; title: string };

  // Basic Info
  title: string;
  description: string;
  type: AssessmentType;

  // Questions & Scoring
  questions: IQuestion[];
  totalPoints: number; // Calculated by backend pre-save hook
  passingScore: number;

  // Settings
  duration?: number; // in minutes
  attempts: number; // Default is 2
  isPublished: boolean;
  isRequiredForCompletion: boolean;

  // Ordering
  order?: number;

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

// For updates
export interface IUpdateAssessment extends Partial<ICreateAssessment> {
  _id?: string;
}

// For reordering
export interface IReorderAssessment {
  assessmentId: string;
  order: number;
}

// Submission types (if needed)
export interface ISubmission {
  _id: string;
  assessmentId: string;
  studentId: string;
  answers: IAnswer[];
  score: number;
  passed: boolean;
  submittedAt: string;
  feedback?: string;
}

export interface IAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  pointsAwarded?: number;
}