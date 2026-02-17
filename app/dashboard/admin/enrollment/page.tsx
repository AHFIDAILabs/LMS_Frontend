'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { enrollmentService } from '@/services/enrollmentService'
import {
  Users,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Calendar,
  BookOpen,
  Filter,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

interface Enrollment {
  _id: string
  studentId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    profileImage?: string
    cohort?: string
  }
  program: {
    _id: string
    title: string
    slug: string
    estimatedHours?: number
  }
  status: string
  cohort?: string
  enrollmentDate: string
  completionDate?: string
  coursesProgress: any[]
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ACTIVE: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  SUSPENDED: 'bg-red-500/20 text-red-400 border-red-500/30',
  DROPPED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock,
  ACTIVE: CheckCircle,
  COMPLETED: Award,
  SUSPENDED: XCircle,
  DROPPED: XCircle,
}

export default function AdminEnrollmentsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  // Fetch enrollments and stats
  const fetchEnrollments = useCallback(async () => {
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
        params.status = filterStatus
      }

      const [enrollmentsResponse, statsResponse] = await Promise.all([
  enrollmentService.getAllEnrollments(params),
  enrollmentService.getEnrollmentStats(undefined, undefined), // ✅ Explicit undefined or remove the call
])

      if (enrollmentsResponse.success && Array.isArray(enrollmentsResponse.data)) {
        setEnrollments(enrollmentsResponse.data)
      } else {
        setEnrollments([])
        setError(enrollmentsResponse.error || 'Failed to fetch enrollments')
      }

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }
    } catch (err: any) {
      setEnrollments([])
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [authLoading, isAuthenticated, user, filterStatus])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  // Client-side filtered enrollments
  const filteredEnrollments = useMemo(() => {
    const term = search.toLowerCase()
    return enrollments.filter(
      e =>
        e.studentId.firstName.toLowerCase().includes(term) ||
        e.studentId.lastName.toLowerCase().includes(term) ||
        e.studentId.email.toLowerCase().includes(term) ||
        e.program.title.toLowerCase().includes(term) ||
        e.cohort?.toLowerCase().includes(term)
    )
  }, [enrollments, search])

  // Delete enrollment
  const handleDeleteEnrollment = async (enrollmentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete enrollment for ${studentName}? This action cannot be undone.`)) {
      return
    }

    try {
      setActionLoading(enrollmentId)
      const response = await enrollmentService.deleteEnrollment(enrollmentId)

      if (response.success) {
        setEnrollments(prev => prev.filter(e => e._id !== enrollmentId))
      } else {
        setError(response.error || 'Failed to delete enrollment')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete enrollment')
    } finally {
      setActionLoading(null)
    }
  }

  // Update enrollment status
  const handleUpdateStatus = async (enrollmentId: string, newStatus: string) => {
    try {
      setActionLoading(enrollmentId)
      const response = await enrollmentService.updateEnrollmentStatus(enrollmentId, {
        status: newStatus,
      })

      if (response.success) {
        setEnrollments(prev =>
          prev.map(e => (e._id === enrollmentId ? { ...e, status: newStatus } : e))
        )
      } else {
        setError(response.error || 'Failed to update status')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
            <h1 className="text-3xl font-bold text-white">Enrollment Management</h1>
            <p className="text-gray-400 mt-1">Manage student enrollments across all programs</p>
          </div>

          <Link
            href="/dashboard/admin/enrollment/createEnroll"
            className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-slate-900 px-4 py-2 rounded-xl font-semibold transition-colors"
          >
            <Plus size={20} />
            Enroll Student
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-lime-400 mt-1">{stats.active}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Dropped</p>
              <p className="text-2xl font-bold text-gray-400 mt-1">{stats.dropped}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.completionRate}%</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students or programs..."
            className="flex-1 bg-slate-800 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DROPPED">Dropped</option>
          </select>
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

        {/* Enrollments List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredEnrollments.length ? (
          <div className="space-y-4">
            {filteredEnrollments.map(enrollment => {
              const isActionLoading = actionLoading === enrollment._id
              const StatusIcon = STATUS_ICONS[enrollment.status] || Clock
              const completedCourses = enrollment.coursesProgress?.filter(
                cp => cp.status === 'COMPLETED'
              ).length || 0
              const totalCourses = enrollment.coursesProgress?.length || 0
              const progress = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0

              return (
                <div
                  key={enrollment._id}
                  className={`bg-slate-800/50 backdrop-blur rounded-xl shadow-lg border border-gray-700 hover:border-gray-600 transition-all p-6 ${
                    isActionLoading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Student Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-lime-500 to-lime-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                        {enrollment.studentId.firstName[0]}
                        {enrollment.studentId.lastName[0]}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {enrollment.studentId.firstName} {enrollment.studentId.lastName}
                        </h3>
                        <p className="text-gray-400 text-sm mb-2">{enrollment.studentId.email}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          {enrollment.cohort && (
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {enrollment.cohort}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            Enrolled {formatDate(enrollment.enrollmentDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Program Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={16} className="text-lime-400" />
                        <h4 className="text-white font-semibold">{enrollment.program.title || ""}</h4>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>
                            {completedCourses}/{totalCourses} courses
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-lime-500 to-lime-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={enrollment.status}
                          onChange={(e) => handleUpdateStatus(enrollment._id, e.target.value)}
                          disabled={isActionLoading}
                          className={`${
                            STATUS_STYLES[enrollment.status]
                          } px-3 py-1 rounded-full text-sm font-semibold border cursor-pointer`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="ACTIVE">Active</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="DROPPED">Dropped</option>
                        </select>

                        <Link
                          href={`/dashboard/admin/enrollments/${enrollment._id}`}
                          className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </Link>

                        <button
                          onClick={() =>
                            handleDeleteEnrollment(
                              enrollment._id,
                              `${enrollment.studentId.firstName} ${enrollment.studentId.lastName}`
                            )
                          }
                          disabled={isActionLoading}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                        >
                          <Trash2 size={14} />
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
            <Users size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No enrollments found.</p>
            {search && (
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}