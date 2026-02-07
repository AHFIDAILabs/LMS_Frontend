'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { instructorService } from '@/services/instructorService'
import InstructorSidebar from '@/components/dashboard/InstructorSide'
import {
  BookOpen,
  Users,
  FileCheck,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Video,
  BarChart3,
  Bell,
  Calendar,
  MessageSquare,
} from 'lucide-react'

interface DashboardStats {
  courses: {
    total: number
    published: number
  }
  students: {
    totalEnrollments: number
    active: number
  }
  assessments: {
    pendingSubmissions: number
    gradedThisWeek: number
  }
  recentActivity: {
    submissions: any[]
  }
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  accentColor = 'text-emerald-400',
  bgColor = 'bg-emerald-400/10',
  borderColor = 'border-emerald-400/20',
}: {
  title: string
  value: number | string
  icon: any
  trend?: { value: number; label?: string }
  accentColor?: string
  bgColor?: string
  borderColor?: string
}) => (
  <div className={`rounded-xl border ${borderColor} ${bgColor} p-6`}>
    <div className="flex items-center justify-between mb-4">
      <Icon className={`w-8 h-8 ${accentColor}`} />
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">+{trend.value}</span>
          {trend.label && <span className="text-gray-500">{trend.label}</span>}
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-gray-400">{title}</div>
  </div>
)

const RecentSubmissionCard = ({ submission }: { submission: any }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
      case 'graded':
        return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
      default:
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20'
    }
  }

  return (
    <div className="bg-slate-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-slate-800 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">
            {submission.assessmentId?.title || 'Assessment'}
          </h4>
          <p className="text-sm text-gray-400">
            {submission.studentId?.firstName} {submission.studentId?.lastName}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(
            submission.status
          )}`}
        >
          {submission.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>
            {new Date(submission.submittedAt).toLocaleDateString()}
          </span>
        </div>
        {submission.score !== undefined && (
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span>Score: {submission.score}</span>
          </div>
        )}
      </div>

      {submission.status === 'submitted' && (
        <Link
          href={`/dashboard/instructor/submissions/${submission._id}`}
          className="mt-3 block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Grade Now →
        </Link>
      )}
    </div>
  )
}

export default function InstructorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setLoading(true)
    try {
      const response = await instructorService.getDashboardStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-2">
              Failed to load dashboard
            </p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchDashboardStats}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg text-sm font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const completionRate = stats
    ? Math.round(
        ((stats.assessments.gradedThisWeek || 0) /
          Math.max(stats.assessments.pendingSubmissions || 1, 1)) *
          100
      )
    : 0

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <InstructorSidebar />

      <div className="flex-1 ml-64 px-3">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur border-b border-gray-800">
          <div className="container-custom p-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">
                Instructor Dashboard
              </h1>
              <p className="text-sm text-gray-400">
                Welcome back, {user?.firstName}!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/instructor/notifications"
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {stats && stats.assessments.pendingSubmissions > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>
              <Link
                href="/dashboard/instructor/settings"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Settings →
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container-custom py-8 space-y-8">
          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-2xl border border-gray-800 bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 p-8">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[140px]" />
            </div>

            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Teaching Overview
                </h2>
                <p className="text-gray-400 text-lg">
                  {stats && stats.courses.total > 0
                    ? `You're teaching ${stats.courses.total} course${
                        stats.courses.total > 1 ? 's' : ''
                      } with ${stats.students.totalEnrollments} student${
                        stats.students.totalEnrollments !== 1 ? 's' : ''
                      }`
                    : 'Start by creating your first course'}
                </p>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-400 mb-1">
                    {stats?.assessments.pendingSubmissions || 0}
                  </div>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-lime-400 mb-1">
                    {stats?.assessments.gradedThisWeek || 0}
                  </div>
                  <p className="text-xs text-gray-500">Graded This Week</p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Courses"
              value={stats?.courses.total || 0}
              icon={BookOpen}
              accentColor="text-emerald-400"
              bgColor="bg-emerald-400/10"
              borderColor="border-emerald-400/20"
            />
            <StatCard
              title="Published Courses"
              value={stats?.courses.published || 0}
              icon={CheckCircle}
              accentColor="text-lime-400"
              bgColor="bg-lime-400/10"
              borderColor="border-lime-400/20"
              trend={{ value: 2, label: 'this month' }}
            />
            <StatCard
              title="Total Students"
              value={stats?.students.totalEnrollments || 0}
              icon={Users}
              accentColor="text-blue-400"
              bgColor="bg-blue-400/10"
              borderColor="border-blue-400/20"
            />
            <StatCard
              title="Active Students"
              value={stats?.students.active || 0}
              icon={TrendingUp}
              accentColor="text-yellow-400"
              bgColor="bg-yellow-400/10"
              borderColor="border-yellow-400/20"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Grading Stats */}
              <div className="grid sm:grid-cols-2 gap-4">
                <StatCard
                  title="Pending Submissions"
                  value={stats?.assessments.pendingSubmissions || 0}
                  icon={FileCheck}
                  accentColor="text-orange-400"
                  bgColor="bg-orange-400/10"
                  borderColor="border-orange-400/20"
                />
                <StatCard
                  title="Graded This Week"
                  value={stats?.assessments.gradedThisWeek || 0}
                  icon={Award}
                  accentColor="text-emerald-400"
                  bgColor="bg-emerald-400/10"
                  borderColor="border-emerald-400/20"
                />
              </div>

              {/* Recent Submissions */}
              <div className="rounded-xl border border-gray-800 bg-slate-900/50">
                <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Recent Submissions
                    </h3>
                    <p className="text-sm text-gray-500">
                      Latest student submissions
                    </p>
                  </div>
                  <Link
                    href="/dashboard/instructor/submissions"
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View All →
                  </Link>
                </div>

                <div className="p-4 space-y-4">
                  {stats?.recentActivity.submissions &&
                  stats.recentActivity.submissions.length > 0 ? (
                    stats.recentActivity.submissions.map((submission) => (
                      <RecentSubmissionCard
                        key={submission._id}
                        submission={submission}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent submissions</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl border border-gray-800 bg-slate-900/50">
                <div className="p-5 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-white">
                    Quick Actions
                  </h3>
                </div>

                <div className="p-4 grid sm:grid-cols-2 gap-3">
                  <Link
                    href="/dashboard/instructor/courses/create"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-gray-700/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center group-hover:bg-emerald-400/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        Create Course
                      </div>
                      <div className="text-xs text-gray-500">
                        Start a new course
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/instructor/submissions/pending"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-gray-700/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-400/10 flex items-center justify-center group-hover:bg-orange-400/20 transition-colors">
                      <FileCheck className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        Grade Submissions
                      </div>
                      <div className="text-xs text-gray-500">
                        {stats?.assessments.pendingSubmissions || 0} pending
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/instructor/content/modules"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-gray-700/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center group-hover:bg-blue-400/20 transition-colors">
                      <Video className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        Manage Content
                      </div>
                      <div className="text-xs text-gray-500">
                        Modules & lessons
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/instructor/students"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-gray-700/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
                      <Users className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        View Students
                      </div>
                      <div className="text-xs text-gray-500">
                        {stats?.students.active || 0} active
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <aside className="space-y-6">
              {/* Course Performance */}
              <div className="rounded-xl border border-gray-800 bg-slate-900/50">
                <div className="p-5 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-white">
                    Course Performance
                  </h3>
                  <p className="text-sm text-gray-500">This week</p>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-400 text-sm">
                      Completion Rate
                    </span>
                    <span className="text-xl font-bold text-emerald-400">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-400 text-sm">
                      Avg. Engagement
                    </span>
                    <span className="text-xl font-bold text-lime-400">
                      78%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-400 text-sm">
                      Student Satisfaction
                    </span>
                    <span className="text-xl font-bold text-yellow-400">
                      4.6/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Schedule */}
              <div className="rounded-xl border border-gray-800 bg-slate-900/50">
                <div className="p-5 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-white">
                    Upcoming Schedule
                  </h3>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Live Session
                      </div>
                      <div className="text-xs text-gray-500">
                        Today at 2:00 PM
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <FileCheck className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Assignment Due
                      </div>
                      <div className="text-xs text-gray-500">Tomorrow</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="rounded-xl border border-gray-800 bg-slate-900/50">
                <div className="p-5 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-white">Quick Links</h3>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { href: '/dashboard/instructor/courses', label: 'My Courses' },
                    { href: '/dashboard/instructor/students', label: 'Student List' },
                    { href: '/dashboard/instructor/analytics', label: 'Analytics' },
                    {
                      href: '/dashboard/instructor/submissions',
                      label: 'All Submissions',
                    },
                    { href: '/dashboard/instructor/content', label: 'Content Library' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-sm text-gray-400 hover:text-white hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors"
                    >
                      {link.label} →
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}