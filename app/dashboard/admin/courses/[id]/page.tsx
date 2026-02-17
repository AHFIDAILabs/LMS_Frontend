// app/dashboard/admin/courses/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { useEnrollmentStats } from '@/hooks/useEnrollmentStats'
import { courseService } from '@/services/courseService'
import { adminService } from '@/services/adminService'
import { Course, CourseModule, Lesson } from '@/types'
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
  Code,
  Video,
  BookText,
  ListChecks,
  FolderKanban,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const LESSON_TYPE_ICONS: Record<string, any> = {
  video: Video,
  reading: BookText,
  coding: Code,
  workshop: Users,
  project: FolderKanban,
  quiz: ListChecks,
}

export default function AdminCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.id as string
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  // ✅ Use enrollment stats hook for course-level stats
  const { 
    stats: enrollmentStats, 
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats 
  } = useEnrollmentStats(undefined, courseId)
  
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<CourseModule[]>([])
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
      const courseResponse = await adminService.getCourseById(courseId)
      
      if (courseResponse.success && courseResponse.data) {
        const courseData = courseResponse.data as Course
        setCourse(courseData)
        
        // Fetch course content (modules and lessons)
        try {
          const contentResponse = await courseService.getCourseContent(courseId)
          if (contentResponse.success && contentResponse.data) {
            setModules((contentResponse.data as any).modules || [])
          }
        } catch (err) {
          console.log('Could not fetch course content:', err)
          setModules([])
        }
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

  const calculateTotalLessons = () => {
    return modules.reduce((total, module) => {
      return total + (module.lessons?.length || 0)
    }, 0)
  }

  const calculateTotalDuration = () => {
    return modules.reduce((total, module) => {
      const moduleDuration = module.lessons?.reduce((sum, lesson) => {
        return sum + (lesson.duration || 0)
      }, 0) || 0
      return total + moduleDuration
    }, 0)
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

  const totalLessons = calculateTotalLessons()
  const totalDuration = calculateTotalDuration()

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
            <div className="relative h-64 bg-gradient-to-br from-slate-700 to-slate-900">
              {course.coverImage ? (
                <img
                  src={course.coverImage}
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

                {/* Approval Status Badge */}
                {course.approvalStatus && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border backdrop-blur-sm ${
                    course.approvalStatus === 'approved' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : course.approvalStatus === 'rejected'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {course.approvalStatus.charAt(0).toUpperCase() + course.approvalStatus.slice(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                  <p className="text-gray-400 text-lg">{course.description}</p>
                  
                  {/* Category and Order */}
                  <div className="flex items-center gap-4 mt-3">
                    {course.category && (
                      <span className="text-sm text-gray-500">
                        Category: <span className="text-gray-300">{course.category}</span>
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      Order: <span className="text-gray-300">#{course.order}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* ✅ Refresh Stats Button */}
                  <button
                    onClick={refreshStats}
                    disabled={statsLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors disabled:opacity-50"
                    title="Refresh enrollment stats"
                  >
                    <RefreshCw size={18} className={statsLoading ? 'animate-spin' : ''} />
                  </button>

                  <Link
                    href={`/dashboard/admin/courses/${course._id}/edit`}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                  >
                    <Edit size={18} />
                    Edit Course
                  </Link>
                </div>
              </div>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-lime-500/20 flex items-center justify-center">
                    <Users className="text-lime-400" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Enrolled</p>
                    <p className="text-white font-semibold">
                      {enrollmentStats?.total || course.currentEnrollment || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Clock className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Duration</p>
                    <p className="text-white font-semibold">
                      {course.estimatedHours ? `${course.estimatedHours}h` : formatDuration(totalDuration)}
                    </p>
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
                    course.level?.includes('beginner') ? 'bg-green-500/20' :
                    course.level?.includes('advanced') ? 'bg-red-500/20' :
                    'bg-yellow-500/20'
                  }`}>
                    <Award className={
                      course.level?.includes('beginner') ? 'text-green-400' :
                      course.level?.includes('advanced') ? 'text-red-400' :
                      'text-yellow-400'
                    } size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Level</p>
                    <p className="text-white font-semibold capitalize">
                      {course.level && Array.isArray(course.level) ? course.level.join(', ') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Level Badges */}
              {course.level && Array.isArray(course.level) && course.level.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {course.level.map((lvl) => (
                    <span
                      key={lvl}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        LEVEL_COLORS[lvl] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ✅ Enrollment Stats Cards (Course-specific) */}
          {enrollmentStats && (
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users size={24} className="text-lime-400" />
                  Enrollment Statistics
                </h2>
                <span className="text-sm text-gray-400">
                  {enrollmentStats.total} total enrollments
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-gray-400" />
                    <p className="text-gray-400 text-xs">Total</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{enrollmentStats.total}</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-blue-400" />
                    <p className="text-gray-400 text-xs">Active</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{enrollmentStats.active}</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <p className="text-gray-400 text-xs">Completed</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{enrollmentStats.completed}</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-yellow-400" />
                    <p className="text-gray-400 text-xs">Pending</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{enrollmentStats.pending}</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock size={16} className="text-orange-400" />
                    <p className="text-gray-400 text-xs">Suspended</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-400">{enrollmentStats.suspended}</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-red-400" />
                    <p className="text-gray-400 text-xs">Dropped</p>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{enrollmentStats.dropped}</p>
                </div>
              </div>

              {/* Completion Rate Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Completion Rate</span>
                  <span className="text-white font-semibold">{enrollmentStats.completionRate}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollmentStats.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ✅ Stats Loading/Error States */}
          {statsLoading && !enrollmentStats && (
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 text-center">
              <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading enrollment statistics...</p>
            </div>
          )}

          {statsError && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4">
              <p className="text-yellow-400 text-sm">
                Unable to load enrollment statistics. {statsError}
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - Modules & Lessons */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Book size={24} className="text-lime-400" />
                    Course Content
                  </h2>
                  <div className="text-sm text-gray-400">
                    {modules.length} modules • {totalLessons} lessons
                  </div>
                </div>

                {modules && modules.length > 0 ? (
                  <div className="space-y-4">
                    {modules
                      .sort((a, b) => a.order - b.order)
                      .map((module, moduleIndex) => (
                        <div
                          key={module._id}
                          className="border border-gray-700 rounded-lg overflow-hidden"
                        >
                          {/* Module Header */}
                          <div className="bg-slate-700/50 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white">
                                  Module {moduleIndex + 1}: {module.title}
                                </h3>
                                {module.description && (
                                  <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>{module.lessons?.length || 0} lessons</span>
                                  {module.duration && <span>{formatDuration(module.duration)}</span>}
                                  {!module.isPublished && (
                                    <span className="text-yellow-400">• Draft</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Lessons List */}
                          {module.lessons && module.lessons.length > 0 && (
                            <div className="divide-y divide-gray-700">
                              {module.lessons
                                .sort((a, b) => a.order - b.order)
                                .map((lesson: Lesson, lessonIndex) => {
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
                                          </div>
                                          
                                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                            <span className="capitalize flex items-center gap-1">
                                              <LessonIcon size={12} />
                                              {lesson.type}
                                            </span>
                                            {lesson.duration && (
                                              <span>{formatDuration(lesson.duration)}</span>
                                            )}
                                            {!lesson.isPublished && (
                                              <span className="text-yellow-400">• Draft</span>
                                            )}
                                            {lesson.videoUrl && (
                                              <span className="text-blue-400">• Has video</span>
                                            )}
                                            {lesson.attachments && lesson.attachments.length > 0 && (
                                              <span className="text-purple-400">
                                                • {lesson.attachments.length} attachment(s)
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          )}

                          {/* No lessons */}
                          {(!module.lessons || module.lessons.length === 0) && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No lessons in this module yet
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

              {/* Learning Objectives */}
              {course.objectives && Array.isArray(course.objectives) && course.objectives.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Learning Objectives</h2>
                  <ul className="space-y-2">
                    {course.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <CheckCircle size={20} className="text-lime-400 shrink-0 mt-0.5" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && Array.isArray(course.prerequisites) && course.prerequisites.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Prerequisites</h2>
                  <ul className="space-y-2">
                    {course.prerequisites.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-gray-500 shrink-0 mt-2" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Completion Criteria */}
              {course.completionCriteria && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Completion Criteria</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Minimum Quiz Score</span>
                      <span className="text-white font-semibold">
                        {course.completionCriteria.minimumQuizScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Required Projects</span>
                      <span className="text-white font-semibold">
                        {course.completionCriteria.requiredProjects}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Capstone Required</span>
                      <span className={`font-semibold ${
                        course.completionCriteria.capstoneRequired ? 'text-lime-400' : 'text-gray-400'
                      }`}>
                        {course.completionCriteria.capstoneRequired ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Course Details */}
            <div className="space-y-6">
              {/* Program Info */}
              {course.program && course.program._id && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Program</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Award className="text-blue-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{course.program.title || 'Untitled Program'}</p>
                      {course.program.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {course.program.description}
                        </p>
                      )}
                      <Link
                        href={`/dashboard/admin/programes/${course.program._id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                      >
                        View Program →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Created By Info */}
              {course.createdBy && course.createdBy._id && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Created By</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {course.createdBy.firstName?.[0] || 'U'}{course.createdBy.lastName?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">
                        {course.createdBy.firstName || 'Unknown'} {course.createdBy.lastName || 'User'}
                      </h4>
                      {course.createdBy.email && (
                        <p className="text-gray-400 text-sm mt-1">{course.createdBy.email}</p>
                      )}
                      <Link
                        href={`/dashboard/admin/users/${course.createdBy._id}`}
                        className="text-lime-400 hover:text-lime-300 text-sm mt-2 inline-block"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructor Info */}
              {course.instructor && course.instructor._id && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Instructor</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {course.instructor.firstName?.[0] || 'I'}{course.instructor.lastName?.[0] || 'I'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">
                        {course.instructor.firstName || 'Unknown'} {course.instructor.lastName || 'Instructor'}
                      </h4>
                      {course.instructor.email && (
                        <p className="text-gray-400 text-sm mt-1">{course.instructor.email}</p>
                      )}
                      <Link
                        href={`/dashboard/admin/users/${course.instructor._id}`}
                        className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Target Audience */}
              {course.targetAudience && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-3">Target Audience</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {course.targetAudience}
                  </p>
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
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Book className="text-gray-500" size={18} />
                    <div>
                      <p className="text-gray-500">Slug</p>
                      <p className="text-white font-mono text-xs">{course.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Award className="text-gray-500" size={18} />
                    <div>
                      <p className="text-gray-500">Modules</p>
                      <p className="text-white">{modules.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}