// ============= USER & AUTH =============
export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'student' | 'instructor'
  status: string
  profileImage?: string
  phoneNumber?: string
  cohort?: string
  githubProfile?: string
  linkedinProfile?: string
  portfolioUrl?: string
  enrollmentDate?: string
  lastLogin?: string
}


export interface AuthResponse {
  token: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber?: string
  cohort?: string
}

// ============= COURSE TYPES (UPDATED) =============

export interface Course {
  _id: string
  title: string
  slug: string
  description: string
  coverImage?: string
  estimatedHours: number
  
  objectives: string[]
  prerequisites: string[]
  targetAudience: string
  
  program: {
    _id: string
    title: string
    slug: string
    description?: string
  }
  
  order: number
  isPublished: boolean
  approvalStatus: 'pending' | 'approved' | 'rejected'
  
  completionCriteria: {
    minimumQuizScore: number
    requiredProjects: number
    capstoneRequired: boolean
  }
  
  currentEnrollment?: number
  
  createdBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  
  createdAt: string
  updatedAt: string
}

export interface CourseDetailResponse {
  course: Course
  modules: CourseModule[]
  stats: {
    totalModules: number
    totalLessons: number
    totalAssessments: number
  }
}

export interface CourseModule {
  _id: string
  course: string
  title: string
  description: string
  order: number
  isPublished: boolean
  lessons?: Lesson[]
  assessments?: Assessment[]
  createdAt: string
  updatedAt: string
}

export interface Assessment {
  _id: string
  courseId: string
  moduleId?: string
  title: string
  description: string
  type: 'quiz' | 'assignment' | 'project'
  order: number
  isPublished: boolean
  questions?: Question[]
  passingScore?: number
  timeLimit?: number
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  name: string
  url: string
  type: string
  size: number
}


export interface Question {
  _id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[] // for multiple choice
  correctAnswer: string | number
  explanation?: string
  points: number
}

export interface EnrolledCourse {
  course: Course
  enrollmentStatus: 'active' | 'completed' | 'dropped'
  lessonsCompleted: number
  totalLessons: number
  completionDate?: string
  progress?: Progress | undefined
}

export interface AssessmentAttempt {
  assessmentId: string
  score: number
  passed: boolean
  attemptNumber: number
  submittedAt: string
}

export interface CourseStats {
  enrollments: {
    total: number
    active: number
    completed: number
    completionRate: number
  }
  progress: {
    averageProgress: number
    averageScore: number
  }
  content: {
    modules: number
    lessons: number
    assessments: number
  }
  currentEnrollment: number
}

export interface CourseCreatePayload {
  program: string
  order?: number
  title: string
  slug: string
  description: string
  estimatedHours?: number
  objectives?: string[]
  prerequisites?: string[]
  targetAudience: string
  coverImage?: File | string
  completionCriteria?: {
    minimumQuizScore: number
    requiredProjects: number
    capstoneRequired: boolean
  }
}

export interface CourseUpdatePayload {
  order?: number
  title?: string
  slug?: string
  description?: string
  estimatedHours?: number
  objectives?: string[]
  prerequisites?: string[]
  targetAudience?: string
  coverImage?: File | string
  isPublished?: boolean
  completionCriteria?: {
    minimumQuizScore: number
    requiredProjects: number
    capstoneRequired: boolean
  }
}

export interface CoursesListResponse {
  success: boolean
  count: number
  total: number
  page: number
  pages: number
  data: Course[]
}

export interface CourseContentResponse {
  success: boolean
  data: {
    course: Course
    modules: CourseModule[]
    courseAssessments: Assessment[]
    stats: {
      totalModules: number
      totalLessons: number
      totalAssessments: number
      publishedModules: number
      publishedLessons: number
    }
  }
}

// ============= MODULE =============
export interface Module {
  _id: string
  courseId: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
  duration: number // in minutes
  createdAt: string
  updatedAt: string
}

export interface ModuleCreate {
  title: string
  description: string
  order: number
}

// ============= LESSON =============
export interface Lesson {
  _id: string
  moduleId: string
  title: string
  content: string // Markdown or HTML content
  videoUrl?: string
  duration: number // in minutes
   isPublished: boolean
  order: number
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface LessonCreate {
  title: string
  content: string
  videoUrl?: string
  duration: number
  order: number
}

// ============= QUIZ =============
export interface Quiz {
  _id: string
  moduleId: string
  title: string
  description: string
  questions: Question[]
  passingScore: number // percentage
  timeLimit?: number // in minutes
  attempts: number // max attempts allowed
  createdAt: string
  updatedAt: string
}

export interface QuizSubmission {
  quizId: string
  answers: Record<string, any> // questionId: answer
}

export interface QuizResult {
  _id: string
  quizId: string
  userId: string
  answers: Record<string, any>
  score: number
  passed: boolean
  submittedAt: string
}

// ============= PROGRESS =============
export interface Progress {
  _id: string
  userId: string
    studentId: string
  courseId: string
  completedLessons: string[]
  completedQuizzes: QuizAttempt[]
  completedAssessments: AssessmentAttempt[]
  overallProgress: number // percentage
  lastAccessedAt: string
  startedAt: string
  completedAt?: string
}

export interface QuizAttempt {
  quizId: string
  score: number
  passed: boolean
  attemptNumber: number
  submittedAt: string
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  completedAt?: string
  timeSpent: number // in seconds
}

// ============= CERTIFICATE =============
export interface Certificate {
  _id: string
  userId: string
  courseId: string
  issuedAt: string
  certificateUrl: string
  verificationCode: string
}

// ============= ADMIN ANALYTICS =============
export interface AdminAnalytics {
  totalStudents: number
  totalCourses: number
  totalEnrollments: number
  averageCompletionRate: number
  recentEnrollments: Enrollment[]
  courseStats: CourseStats[]
}

export interface Enrollment {
  _id: string
  userId: string
  courseId: string
  userName: string
  courseName: string
  enrolledAt: string
  progress: Progress
}

export interface CourseStats {
  courseId: string
  courseName: string
  enrollments: { total: number; active: number; completed: number; completionRate: number; }
  completions: number
  averageScore: number
  completionRate: number
}

// ============= STUDENT DASHBOARD =============
export interface StudentDashboard {
  enrolledCourses: EnrolledCourse[]
  recentActivity: Activity[]
  upcomingQuizzes: Quiz[]
  certificates: Certificate[]
}
export interface Activity {
  _id: string
  type: 'lesson-completed' | 'quiz-attempted' | 'course-enrolled' | 'certificate-earned'
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

// ============= API RESPONSES =============
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  message?: string;
}


export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}



export type Instructor = {
  id: string
  name: string
  avatar: string
  title?: string
  bio?: string
  qualifications?: string[]
  rating?: number
  reviews?: number
  experience?: number
  socials?: { linkedin?: string; twitter?: string; github?: string }
  role?: "instructor"
  isVerified?: boolean
}



export interface Program {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category?: string;
  tags?: string[];
  courses: Course[];
  order: number;
  estimatedHours?: number;
  instructors: Instructor[];
  coverImage?: string;
  bannerImage?: string;
  price?: number;
  currency?: string;
  enrollmentLimit?: number;
  isPublished: boolean;
  startDate?: string;
  endDate?: string;
  isSelfPaced?: boolean;
  certificateTemplate?: string;
   approvalStatus: 'pending' | 'approved' | 'rejected';
  prerequisites?: string[];
  targetAudience?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramPayload {
  title: string
  description: string
  category?: string
  tags?: string[]
  instructors?: string[]
  price?: number
  currency?: string
  prerequisites?: string[]
  targetAudience?: string
}


// ============= END OF FILE =============