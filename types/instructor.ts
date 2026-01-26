export type Instructor = {
  id: string
  name: string
  avatar: string // image URL
  title: string // e.g. "Senior AI Engineer"
  bio: string
  qualifications: string[]
  rating: number
  reviews: number
  experience: number // years
  socials?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  role: "user" | "instructor" | "admin"
  isVerified: boolean // admin approval
}
