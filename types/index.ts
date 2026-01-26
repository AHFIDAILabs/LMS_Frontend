// ============= USER & AUTH =============
export interface User {
  id: string
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

// ============= COURSE =============
export interface Course {
  _id: string
  title: string
  description: string
  instructor: string
  duration: string // e.g., "8 weeks"
  level: 'beginner' | 'intermediate' | 'advanced'
  thumbnail?: string
  modules: Module[]
  totalLessons: number
  totalDuration: number // in minutes
  enrolledStudents: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface CourseCreate {
  title: string
  description: string
  instructor: string
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  thumbnail?: string
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

export interface Attachment {
  name: string
  url: string
  type: string
  size: number
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

export interface Question {
  _id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[] // for multiple choice
  correctAnswer: string | number
  explanation?: string
  points: number
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
  courseId: string
  completedLessons: string[]
  completedQuizzes: QuizAttempt[]
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
  progress: number
}

export interface CourseStats {
  courseId: string
  courseName: string
  enrollments: number
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

export interface EnrolledCourse {
  course: Course
  progress: Progress
  nextLesson?: Lesson
}

export interface Activity {
  _id: string
  type: 'lesson-completed' | 'quiz-attempted' | 'course-enrolled' | 'certificate-earned'
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

// ============= API RESPONSES =============
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
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