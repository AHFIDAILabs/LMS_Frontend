'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { courseService } from '@/services/courseService'
import { Course } from '@/types'
import { 
  BookOpen, 
  Eye, 
  Edit, 
  Trash2, 
  Globe, 
  Lock, 
  Plus, 
  Users, 
  Clock,
  RefreshCw,
  Award,
  Filter,
  Search
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminProgramCoursesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [filterLevel, setFilterLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
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
      
      console.log('🔄 Fetching courses...')
      
      const params: any = {}
      if (filterStatus !== 'all') {
        params.isPublished = filterStatus === 'published'
      }

      const response = await courseService.getAllCoursesAdmin(params)
      
      console.log('📦 Courses response:', response)
      
      if (response.success) {
        const coursesData = Array.isArray(response.data) ? response.data : []
        console.log('✅ Courses loaded:', coursesData.length)
        setCourses(coursesData)
        
        if (coursesData.length === 0) {
          toast('No courses found. Try creating one!', { icon: '📚' })
        }
      } else {
        console.error('❌ Failed to fetch courses:', response.error)
        setCourses([])
        setError(response.error || 'Failed to fetch courses')
        toast.error(response.error || 'Failed to fetch courses')
      }
    } catch (err: any) {
      console.error('❌ Error fetching courses:', err)
      setCourses([])
      setError(err.message || 'An error occurred')
      toast.error(err.message || 'Failed to load courses')
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
    return courses.filter(c => {
      const matchesSearch = 
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
      
      const matchesLevel = filterLevel === 'all' || 
        (c.level && c.level.includes(filterLevel))
      
      return matchesSearch && matchesLevel
    })
  }, [courses, search, filterLevel])

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
        toast.success('Course status updated!')
      } else {
        setError(response.error || 'Failed to toggle publish status')
        toast.error(response.error || 'Failed to update status')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle publish status')
      toast.error(err.message || 'Failed to update status')
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
        toast.success('Course deleted successfully!')
      } else {
        setError(response.error || 'Failed to delete course')
        toast.error(response.error || 'Failed to delete course')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete course')
      toast.error(err.message || 'Failed to delete')
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
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href="/dashboard/admin/programes"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Programs
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-white">Courses</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Course Management</h1>
            <p className="text-gray-400 mt-1">Manage all courses across programs</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchCourses}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
            
            <Link
              href="/dashboard/admin/courses/create"
              className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-slate-900 px-4 py-2 rounded-xl font-semibold transition-colors"
            >
              <Plus size={20} />
              Create Course
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-slate-800 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-800 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as any)}
            className="bg-slate-800 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Courses</p>
            <p className="text-2xl font-bold text-white mt-1">{courses.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Published</p>
            <p className="text-2xl font-bold text-lime-400 mt-1">
              {courses.filter(c => c.isPublished).length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Draft</p>
            <p className="text-2xl font-bold text-gray-400 mt-1">
              {courses.filter(c => !c.isPublished).length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Enrolled</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {courses.reduce((acc, c) => acc + (c.currentEnrollment || 0), 0)}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-300 text-sm underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Course List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading courses...</p>
          </div>
        ) : filteredCourses.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const isActionLoading = actionLoading === course._id
              const levelBadgeColor = 
                course.level?.[0] === 'beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                course.level?.[0] === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              
              return (
                <div
                  key={course._id}
                  className={`bg-slate-800/50 backdrop-blur rounded-xl shadow-lg border border-gray-700 hover:border-gray-600 transition-all overflow-hidden ${
                    isActionLoading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {/* Header with gradient */}
                  <div className="relative h-32 bg-gradient-to-br from-blue-500/20 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
                    <BookOpen size={48} className="text-blue-400" />
                    
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        course.isPublished 
                          ? 'bg-lime-500/20 text-lime-400 border-lime-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
                    </div>

                    {/* Level badge */}
                    {course.level && course.level.length > 0 && (
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${levelBadgeColor}`}>
                          {course.level[0].charAt(0).toUpperCase() + course.level[0].slice(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {course.description || 'No description available'}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-slate-700/50 rounded">
                        {course.category}
                      </span>
                      {course.program && typeof course.program === 'object' && (
                        <span className="flex items-center gap-1">
                          <Award size={12} className="text-lime-400" />
                          {course.program.title}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-400 pb-4 border-b border-gray-700">
                      {course.estimatedHours && (
                        <span className="flex items-center gap-2">
                          <Clock size={16} className="text-purple-400" />
                          {course.estimatedHours}h
                        </span>
                      )}
                      
                      {course.currentEnrollment !== undefined && (
                        <span className="flex items-center gap-2">
                          <Users size={16} className="text-blue-400" />
                          {course.currentEnrollment} enrolled
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/dashboard/admin/courses/${course._id}`}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                      
                      <Link
                        href={`/dashboard/admin/courses/${course._id}/edit`}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                      >
                        <Edit size={16} />
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleTogglePublish(course._id)}
                        disabled={isActionLoading}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
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
                      
                      <button
                        onClick={() => handleDeleteCourse(course._id, course.title)}
                        disabled={isActionLoading}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {search || filterLevel !== 'all' ? 'No courses match your filters.' : 'No courses found.'}
            </p>
            {search || filterLevel !== 'all' ? (
              <p className="text-gray-500 text-sm">
                Try adjusting your search or filters
              </p>
            ) : (
              <Link
                href="/dashboard/admin/courses/create"
                className="inline-flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-slate-900 px-6 py-3 rounded-xl font-semibold transition-colors mt-4"
              >
                <Plus size={20} />
                Create Your First Course
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}