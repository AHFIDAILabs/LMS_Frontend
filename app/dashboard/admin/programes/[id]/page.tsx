// app/dashboard/admin/programes/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { useEnrollmentStats } from '@/hooks/useEnrollmentStats'
import { programService } from '@/services/programService'
import {
  Award,
  ArrowLeft,
  Edit,
  Globe,
  Lock,
  BookOpen,
  Users,
  Clock,
  Tag,
  Calendar,
  Book,
  TrendingUp,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { Course, Program } from '@/types'

export default function AdminProgramDetailPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params?.id as string
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  // ✅ Use the enrollment stats hook
  const { 
    stats: enrollmentStats, 
    loading: statsLoading, 
    error: statsError,
    refresh: refreshStats 
  } = useEnrollmentStats(programId)
  
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    fetchProgramDetails()
  }, [authLoading, isAuthenticated, user, programId])

  const fetchProgramDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📊 Fetching program details for:', programId)
      
      const programResponse = await programService.getProgramById(programId)
      
      console.log('Program Response:', programResponse)
      
      if (programResponse.success && programResponse.data) {
        setProgram(programResponse.data as Program)
      } else {
        setError(programResponse.error || 'Failed to fetch program details')
      }
    } catch (err: any) {
      console.error('❌ Error fetching program:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDuration = (hours?: number) => {
    if (!hours) return 'N/A'
    return `${hours}h`
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

  if (error || !program) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Program Not Found</h1>
            <p className="text-gray-400 mb-4">{error || 'Unable to load program details'}</p>
            <Link
              href="/dashboard/admin/programes"
              className="text-lime-400 hover:text-lime-300 underline"
            >
              Back to Programs
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const courses = Array.isArray(program.courses) 
    ? (program.courses as Course[]).filter((c): c is Course => typeof c !== 'string')
    : []

  const totalCourses = courses.length
  const totalDuration = courses.reduce((acc, course) => acc + (course.estimatedHours || 0), 0)
  const totalEnrollments = enrollmentStats?.total || 0
  const completionRate = enrollmentStats?.completionRate || 0
  const totalCourseEnrollments = courses.reduce((sum, course) => 
    sum + (course.currentEnrollment || 0), 0
  )

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Back Button */}
        <Link
          href="/dashboard/admin/programes"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Programs
        </Link>

        <div className="space-y-6">
          {/* Program Header */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
            {/* Hero Section */}
            <div className="relative h-48 bg-gradient-to-br from-lime-500/20 via-slate-800 to-slate-900 p-8 flex items-center">
              <div className="absolute inset-0 overflow-hidden">
                <Award size={200} className="absolute -right-12 -top-12 text-lime-500/10" />
              </div>
              
              <div className="relative flex items-center gap-6 flex-1">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-lime-500 to-lime-600 flex items-center justify-center shrink-0">
                  <Award size={48} className="text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{program.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                      program.isPublished 
                        ? 'bg-lime-500/20 text-lime-400 border-lime-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {program.isPublished ? (
                        <span className="flex items-center gap-1">
                          <Globe size={14} /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Lock size={14} /> Draft
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-gray-300 text-lg line-clamp-2">{program.description}</p>
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
                    href={`/dashboard/admin/programes/${program._id}/edit`}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                  >
                    <Edit size={18} />
                    Edit Program
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-t border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-lime-500/20 flex items-center justify-center">
                  <BookOpen className="text-lime-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Courses</p>
                  <p className="text-white font-semibold text-lg">{totalCourses}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Students Enrolled</p>
                  <p className="text-white font-semibold text-lg">{totalEnrollments}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Clock className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Total Duration</p>
                  <p className="text-white font-semibold text-lg">{formatDuration(totalDuration)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="text-emerald-400" size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Completion Rate</p>
                  <p className="text-white font-semibold text-lg">{completionRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment Stats Cards */}
          {enrollmentStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-gray-400" />
                  <p className="text-gray-400 text-xs">Total</p>
                </div>
                <p className="text-2xl font-bold text-white">{enrollmentStats.total}</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-blue-400" />
                  <p className="text-gray-400 text-xs">Active</p>
                </div>
                <p className="text-2xl font-bold text-blue-400">{enrollmentStats.active}</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <p className="text-gray-400 text-xs">Completed</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{enrollmentStats.completed}</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-yellow-400" />
                  <p className="text-gray-400 text-xs">Pending</p>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{enrollmentStats.pending}</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={16} className="text-orange-400" />
                  <p className="text-gray-400 text-xs">Suspended</p>
                </div>
                <p className="text-2xl font-bold text-orange-400">{enrollmentStats.suspended}</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-red-400" />
                  <p className="text-gray-400 text-xs">Dropped</p>
                </div>
                <p className="text-2xl font-bold text-red-400">{enrollmentStats.dropped}</p>
              </div>
            </div>
          )}

          {/* ✅ Stats Loading/Error States */}
          {statsLoading && !enrollmentStats && (
            <div className="text-center py-4 text-gray-400 text-sm">
              Loading enrollment statistics...
            </div>
          )}

          {statsError && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4">
              <p className="text-yellow-400 text-sm">
                Unable to load enrollment statistics: {statsError}
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - Courses */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={24} className="text-lime-400" />
                  Program Courses
                </h2>

                {courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.map((course, index) => {
                      // ✅ Handle level properly (it's an array)
                      const level = Array.isArray(course.level) && course.level.length > 0
                        ? course.level[0]
                        : undefined
                      
                      return (
                        <Link
                          key={course._id}
                          href={`/dashboard/admin/courses/${course._id}`}
                          className="block group"
                        >
                          <div className="flex gap-4 p-4 rounded-lg border border-gray-700 hover:border-lime-500/50 bg-slate-700/30 hover:bg-slate-700/50 transition-all">
                            {/* Thumbnail */}
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                              {course.coverImage ? (
                                <img
                                  src={course.coverImage.startsWith('http') ? course.coverImage : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${course.coverImage}`}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <Book size={32} className="text-gray-600" />
                              )}
                            </div>

                            {/* Course Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lime-400 font-semibold text-sm">
                                      Course {index + 1}
                                    </span>
                                    {level && (
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                                        level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                      }`}>
                                        {level}
                                      </span>
                                    )}
                                    {!course.isPublished && (
                                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
                                        Draft
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-white font-semibold group-hover:text-lime-400 transition-colors">
                                    {course.title}
                                  </h3>
                                  <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                                    {course.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                {course.category && (
                                  <span className="flex items-center gap-1">
                                    <Tag size={12} />
                                    {course.category}
                                  </span>
                                )}
                                {course.estimatedHours && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {course.estimatedHours}h
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Users size={12} />
                                  {course.currentEnrollment || 0} enrolled
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No courses in this program yet</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Edit this program to add courses
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Program Details */}
            <div className="space-y-6">
              {/* Tags */}
              {program.tags && program.tags.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Tag size={20} className="text-lime-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-lime-500/10 text-lime-400 rounded-full text-sm border border-lime-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                <div className="space-y-3">
                  {program.category && (
                    <div className="flex items-center gap-3 text-sm">
                      <Tag className="text-gray-500" size={18} />
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="text-white">{program.category}</p>
                      </div>
                    </div>
                  )}

                  {program.estimatedHours && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="text-gray-500" size={18} />
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="text-white">{program.estimatedHours} hours</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="text-gray-500" size={18} />
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="text-white">{formatDate(program.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="text-gray-500" size={18} />
                    <div>
                      <p className="text-gray-500">Last Updated</p>
                      <p className="text-white">{formatDate(program.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Total Courses</span>
                    <span className="text-xl font-bold text-lime-400">{totalCourses}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Program Enrollments</span>
                    <span className="text-xl font-bold text-blue-400">{totalEnrollments}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Course Enrollments</span>
                    <span className="text-xl font-bold text-purple-400">{totalCourseEnrollments}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Completion Rate</span>
                    <span className="text-xl font-bold text-emerald-400">{completionRate}%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href={`/dashboard/admin/enrollment?programId=${programId}`}
                    className="block text-sm text-gray-400 hover:text-white hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors"
                  >
                    View Enrollments →
                  </Link>
                  <Link
                    href={`/dashboard/admin/programes/${programId}/students`}
                    className="block text-sm text-gray-400 hover:text-white hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors"
                  >
                    View Students →
                  </Link>
                  <Link
                    href={`/dashboard/admin/programes/${programId}/edit`}
                    className="block text-sm text-gray-400 hover:text-white hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors"
                  >
                    Edit Program →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}