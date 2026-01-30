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

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber?: string
  cohort?: string
}