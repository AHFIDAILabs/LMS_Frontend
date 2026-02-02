'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { courseService } from '@/services/courseService'
import {
  Book,
  ArrowLeft,
  Edit,
  Globe,
  Lock,
  Users,
  Clock,
  Award,
  BookOpen,
  CheckCircle,
  PlayCircle,
  FileText,
  Calendar,
  User,
} from 'lucide-react'
import Link from 'next/link'

interface Lesson {
  _id: string
  title: string
  description: string
  type: 'video' | 'text' | 'quiz' | 'assignment'
  duration?: number
  order: number
  isPublished: boolean
}

interface Module {
  _id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

interface CourseDetail {
  _id: string
  title: string
  description: string
  category: string
  level: string
  isPublished: boolean
  isApproved?: boolean
  instructor?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  program?: {
    _id: string
    name: string
  }
  thumbnail?: string
  duration?: number
  enrollmentCount?: number
  modules?: Module[]
  requirements?: string[]
  learningOutcomes?: string[]
  createdAt: string
  updatedAt: string
}

const LEVEL_STYLES: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const LESSON_TYPE_ICONS = {
  video: PlayCircle,
  text: FileText,
  quiz: CheckCircle,
  assignment: BookOpen,
}

export default function AdminCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.id as string
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    fetchCourseDetails()
  }, [authLoading, isAuthenticated, user, courseId])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch course basic info
      const courseResponse = await courseService.getCourseById(courseId)
      
      if (courseResponse.success && courseResponse.data) {
        const courseData = courseResponse.data as CourseDetail
        
        // Fetch course content (modules and lessons)
        try {
          const contentResponse = await courseService.getCourseContent(courseId)
          if (contentResponse.success && contentResponse.data) {
            courseData.modules = (contentResponse.data as any).modules || []
          }
        } catch (err) {
          console.log('Could not fetch course content:', err)
        }
        
        setCourse(courseData)
      } else {
        setError(courseResponse.error || 'Failed to fetch course details')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Course Not Found</h1>
            <p className="text-gray-400 mb-4">{error || 'Unable to load course details'}</p>
            <Link
              href="/dashboard/admin/courses"
              className="text-lime-400 hover:text-lime-300 underline"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Back Button */}
        <Link
          href="/dashboard/admin/courses"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Courses
        </Link>

        <div className="space-y-6">
          {/* Course Header */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
            {/* Hero Image */}
            <div className="relative h-64 bg-linear-to-br from-slate-700 to-slate-900">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Book size={80} className="text-gray-600" />
                </div>
              )}
              
              {/* Overlay badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border backdrop-blur-sm ${
                  course.isPublished 
                    ? 'bg-lime-500/20 text-lime-400 border-lime-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                  {course.isPublished ? (
                    <span className="flex items-center gap-1">
                      <Globe size={16} /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Lock size={16} /> Draft
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Course Info */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                  <p className="text-gray-400 text-lg">{course.description}</p>
                </div>
                
                <Link
                  href={`/admin/courses/${course._id}/edit`}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                >
                  <Edit size={18} />
                  Edit Course
                </Link>
              </div>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-lime-500/20 flex items-center justify-center">
                    <Users className="text-lime-400" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Enrolled</p>
                    <p className="text-white font-semibold">{course.enrollmentCount || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Clock className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Duration</p>
                    <p className="text-white font-semibold">{formatDuration(course.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <BookOpen className="text-purple-400" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Lessons</p>
                    <p className="text-white font-semibold">{totalLessons}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    course.level === 'beginner' ? 'bg-green-500/20' :
                    course.level === 'intermediate' ? 'bg-yellow-500/20' :
                    'bg-red-500/20'
                  }`}>
                    <Award className={
                      course.level === 'beginner' ? 'text-green-400' :
                      course.level === 'intermediate' ? 'text-yellow-400' :
                      'text-red-400'
                    } size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Level</p>
                    <p className="text-white font-semibold capitalize">{course.level}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - Modules & Lessons */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Book size={24} className="text-lime-400" />
                  Course Content
                </h2>

                {course.modules && course.modules.length > 0 ? (
                  <div className="space-y-4">
                    {course.modules
                      .sort((a, b) => a.order - b.order)
                      .map((module, moduleIndex) => (
                        <div
                          key={module._id}
                          className="border border-gray-700 rounded-lg overflow-hidden"
                        >
                          {/* Module Header */}
                          <div className="bg-slate-700/50 p-4">
                            <h3 className="text-lg font-semibold text-white">
                              Module {moduleIndex + 1}: {module.title}
                            </h3>
                            {module.description && (
                              <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-2">
                              {module.lessons?.length || 0} lessons
                            </p>
                          </div>

                          {/* Lessons List */}
                          {module.lessons && module.lessons.length > 0 && (
                            <div className="divide-y divide-gray-700">
                              {module.lessons
                                .sort((a, b) => a.order - b.order)
                                .map((lesson, lessonIndex) => {
                                  const LessonIcon = LESSON_TYPE_ICONS[lesson.type] || FileText
                                  
                                  return (
                                    <div
                                      key={lesson._id}
                                      className="p-4 hover:bg-slate-700/30 transition-colors"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center shrink-0">
                                          <LessonIcon size={16} className="text-gray-300" />
                                        </div>
                                        
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <h4 className="text-white font-medium">
                                              {lessonIndex + 1}. {lesson.title}
                                            </h4>
                                            {!lesson.isPublished && (
                                              <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded">
                                                Draft
                                              </span>
                                            )}
                                          </div>
                                          
                                          {lesson.description && (
                                            <p className="text-gray-400 text-sm mt-1">
                                              {lesson.description}
                                            </p>
                                          )}
                                          
                                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                            <span className="capitalize">{lesson.type}</span>
                                            {lesson.duration && (
                                              <span>{formatDuration(lesson.duration)}</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No modules or lessons yet</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Add content to make this course available to students
                    </p>
                  </div>
                )}
              </div>

              {/* Learning Outcomes */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Learning Outcomes</h2>
                  <ul className="space-y-2">
                    {course.learningOutcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <CheckCircle size={20} className="text-lime-400 shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-gray-500 shrink-0 mt-2" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar - Course Details */}
            <div className="space-y-6">
              {/* Instructor Info */}
              {course.instructor && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Instructor</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-lime-500 to-lime-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                      {course.instructor.firstName[0]}{course.instructor.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">
                        {course.instructor.firstName} {course.instructor.lastName}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">{course.instructor.email}</p>
                      <Link
                        href={`/admin/users/${course.instructor._id}`}
                        className="text-lime-400 hover:text-lime-300 text-sm mt-2 inline-block"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Program Info */}
              {course.program && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Program</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Award className="text-blue-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{course.program.name}</p>
                      <Link
                        href={`/admin/programs/${course.program._id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-block"
                      >
                        View Program →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="text-gray-500" size={18} />
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="text-white">{formatDate(course.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="text-gray-500" size={18} />
                    <div>
                      <p className="text-gray-500">Last Updated</p>
                      <p className="text-white">{formatDate(course.updatedAt)}</p>
                    </div>
                  </div>
                  
                  {course.category && (
                    <div className="flex items-center gap-3 text-sm">
                      <Book className="text-gray-500" size={18} />
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="text-white">{course.category}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}