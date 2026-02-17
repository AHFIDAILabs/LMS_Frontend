// app/dashboard/admin/courses/page.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { useEnrollment } from '@/lib/context/EnrollmentContext'
import { courseService } from '@/services/courseService'
import { Course } from '@/types'
import { 
  Book, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Globe, 
  Lock, 
  Plus,
  Users,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

// Badge styles
const LEVEL_STYLES: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const STATUS_STYLES = {
  published: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function AdminCoursesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { refreshEnrollments, enrollmentStats } = useEnrollment()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== 'admin') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const params: any = {}
      if (filterStatus !== 'all') {
        params.isPublished = filterStatus === 'published'
      }

      const response = await courseService.getAllCoursesAdmin(params)
      
      if (response.success && Array.isArray(response.data)) {
        setCourses(response.data)
      } else {
        setCourses([])
        setError(response.error || 'Failed to fetch courses')
      }
    } catch (err: any) {
      setCourses([])
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [authLoading, isAuthenticated, user, filterStatus])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Client-side filtered courses
  const filteredCourses = useMemo(() => {
    const term = search.toLowerCase()
    return courses.filter(
      c =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term) ||
        c.createdBy?.firstName?.toLowerCase().includes(term) ||
        c.createdBy?.lastName?.toLowerCase().includes(term)
    )
  }, [courses, search])

  // ✅ Calculate total enrollments from stats (more accurate)
  const totalEnrollments = useMemo(() => {
    return Object.values(enrollmentStats).reduce((sum, stats) => sum + (stats?.total || 0), 0)
  }, [enrollmentStats])

  // ✅ Get course enrollment count (prefer stats over currentEnrollment)
  const getCourseEnrollmentCount = useCallback((courseId: string, fallback: number = 0) => {
    const stats = enrollmentStats[courseId]
    return stats?.total ?? fallback
  }, [enrollmentStats])

  // ✅ Get course-specific enrollment stats
  const getCourseStats = useCallback((courseId: string) => {
    return enrollmentStats[courseId] || null
  }, [enrollmentStats])

  // Toggle publish status
  const handleTogglePublish = async (courseId: string) => {
    try {
      setActionLoading(courseId)
      const response = await courseService.togglePublish(courseId)
      
      if (response.success) {
        setCourses(prev =>
          prev.map(c =>
            c._id === courseId ? { ...c, isPublished: !c.isPublished } : c
          )
        )
      } else {
        setError(response.error || 'Failed to toggle publish status')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle publish status')
    } finally {
      setActionLoading(null)
    }
  }

  // Approve course
  const handleApproveCourse = async (courseId: string) => {
    try {
      setActionLoading(courseId)
      const response = await courseService.approveCourse(courseId)
      
      if (response.success) {
        setCourses(prev =>
          prev.map(c =>
            c._id === courseId ? { ...c, isApproved: true, approvalStatus: 'approved' } : c
          )
        )
      } else {
        setError(response.error || 'Failed to approve course')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve course')
    } finally {
      setActionLoading(null)
    }
  }

  // Reject course
  const handleRejectCourse = async (courseId: string) => {
    try {
      setActionLoading(courseId)
      const response = await courseService.rejectCourse(courseId)
      
      if (response.success) {
        setCourses(prev =>
          prev.map(c =>
            c._id === courseId ? { ...c, isApproved: false, approvalStatus: 'rejected' } : c
          )
        )
      } else {
        setError(response.error || 'Failed to reject course')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject course')
    } finally {
      setActionLoading(null)
    }
  }

  // Delete course
  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setActionLoading(courseId)
      const response = await courseService.deleteCourse(courseId)
      
      if (response.success) {
        setCourses(prev => prev.filter(c => c._id !== courseId))
        
        // ✅ Refresh enrollments after deleting a course
        await refreshEnrollments()
      } else {
        setError(response.error || 'Failed to delete course')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete course')
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Course Management</h1>
            <p className="text-gray-400 mt-1">Manage all courses across the platform</p>
          </div>
          
          <Link
            href="/dashboard/admin/courses/create"
            className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-slate-900 px-4 py-2 rounded-xl font-semibold transition-colors"
          >
            <Plus size={20} />
            Create Course
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="flex-1 bg-slate-800 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-800 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
          >
            <option value="all">All Courses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Enhanced Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-lime-500/20 flex items-center justify-center">
                <Book className="text-lime-400" size={20} />
              </div>
              <p className="text-gray-400 text-sm">Total Courses</p>
            </div>
            <p className="text-2xl font-bold text-white">{courses.length}</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Globe className="text-emerald-400" size={20} />
              </div>
              <p className="text-gray-400 text-sm">Published</p>
            </div>
            <p className="text-2xl font-bold text-lime-400">
              {courses.filter(c => c.isPublished).length}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                <Lock className="text-gray-400" size={20} />
              </div>
              <p className="text-gray-400 text-sm">Draft</p>
            </div>
            <p className="text-2xl font-bold text-gray-400">
              {courses.filter(c => !c.isPublished).length}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="text-blue-400" size={20} />
              </div>
              <p className="text-gray-400 text-sm">Total Enrollments</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{totalEnrollments}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-300 text-sm underline mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Course List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCourses.length ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredCourses.map(course => {
              const isActionLoading = actionLoading === course._id
              const courseStats = getCourseStats(course._id)
              // ✅ Use stats as primary source, fallback to course.currentEnrollment
              const enrollmentCount = getCourseEnrollmentCount(course._id, course.currentEnrollment || 0)
              
              return (
                <div
                  key={course._id}
                  className={`bg-slate-800/50 backdrop-blur rounded-xl shadow-lg p-6 border border-gray-700 hover:border-gray-600 transition-all ${
                    isActionLoading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Cover Image */}
                    <div className="w-full lg:w-48 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {course.coverImage ? (
                        <img
                          src={course.coverImage.startsWith('http') ? course.coverImage : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${course.coverImage}`}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement!.innerHTML = `<svg class="text-gray-600" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
                          }}
                        />
                      ) : (
                        <Book size={48} className="text-gray-600" />
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {course.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        
                        {/* Status badges */}
                        <div className="flex gap-2 flex-wrap justify-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            course.isPublished ? STATUS_STYLES.published : STATUS_STYLES.draft
                          }`}>
                            {course.isPublished ? (
                              <span className="flex items-center gap-1">
                                <Globe size={12} /> Published
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Lock size={12} /> Draft
                              </span>
                            )}
                          </span>
                          
                          {course.level && (() => {
                            const level = Array.isArray(course.level) ? course.level[0] : course.level;
                            const levelKey = level?.toLowerCase() || 'beginner';
                            
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                LEVEL_STYLES[levelKey] || LEVEL_STYLES.beginner
                              }`}>
                                {level}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        {course.instructor && (
                          <span className="flex items-center gap-1">
                            <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                              {course.instructor?.firstName?.[0]}{course.instructor?.lastName?.[0]}
                            </span>
                            {course.instructor?.firstName} {course.instructor?.lastName}
                          </span>
                        )}
                        
                        {course.category && (
                          <span className="px-2 py-1 bg-slate-700/50 rounded">
                            {course.category}
                          </span>
                        )}
                        
                        {course.program && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                            {course.program.title}
                          </span>
                        )}
                        
                        {/* ✅ Fixed: Show stats-based enrollment count */}
                        <span className="flex items-center gap-1.5">
                          <Users size={14} />
                          <span className="font-medium text-white">
                            {enrollmentCount}
                          </span>
                          <span>enrolled</span>
                          {courseStats && courseStats.active > 0 && (
                            <span className="text-emerald-400">
                              ({courseStats.active} active)
                            </span>
                          )}
                        </span>

                        {/* Show completion rate if available */}
                        {courseStats && courseStats.completionRate > 0 && (
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <TrendingUp size={14} />
                            {courseStats.completionRate}% completion
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Link
                          href={`/dashboard/admin/courses/${course._id}`}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                        
                        <Link
                          href={`/dashboard/admin/courses/${course._id}/edit`}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                        >
                          <Edit size={16} />
                          Edit
                        </Link>
                        
                        <button
                          onClick={() => handleTogglePublish(course._id)}
                          disabled={isActionLoading}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            course.isPublished
                              ? 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400'
                              : 'bg-lime-500/20 hover:bg-lime-500/30 text-lime-400'
                          }`}
                        >
                          {course.isPublished ? (
                            <>
                              <Lock size={16} />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Globe size={16} />
                              Publish
                            </>
                          )}
                        </button>
                        
                        {!course.approvalStatus && (
                          <>
                            <button
                              onClick={() => handleApproveCourse(course._id)}
                              disabled={isActionLoading}
                              className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors"
                            >
                              <CheckCircle size={16} />
                              Approve
                            </button>
                            
                            <button
                              onClick={() => handleRejectCourse(course._id)}
                              disabled={isActionLoading}
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDeleteCourse(course._id, course.title)}
                          disabled={isActionLoading}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors ml-auto"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Book size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No courses found.</p>
            {search && (
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}