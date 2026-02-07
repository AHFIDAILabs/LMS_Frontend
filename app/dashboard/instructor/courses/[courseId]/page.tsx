'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import InstructorSidebar from '@/components/dashboard/InstructorSide'
import { instructorService } from '@/services/instructorService'
import {
  BookOpen,
  Users,
  Layers,
  BarChart3,
  Edit,
  LayoutList,
  ArrowLeft,
  Settings,
  Eye,
  Clock,
  Award,
  TrendingUp,
  FileText,
  Play,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export default function InstructorCourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return

    const fetchCourse = async () => {
      try {
        setLoading(true)
        const res = await instructorService.getCourse(courseId)
        if (res.success) {
          setData(res.data)
        } else {
          setError(res.error || 'Failed to load course')
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading course details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-2">
              Failed to load course
            </p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg text-sm font-semibold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { course, modules, enrollmentStats } = data

  const totalStudents =
    enrollmentStats?.reduce((sum: number, s: any) => sum + s.count, 0) || 0
  
  const totalLessons = modules?.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) || 0
  const publishedModules = modules?.filter((m: any) => m.isPublished).length || 0
  const completionRate = totalStudents > 0 ? Math.round((publishedModules / Math.max(modules?.length || 1, 1)) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <InstructorSidebar />

      <div className="flex-1 ml-64">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur border-b border-gray-800">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard/instructor/courses')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white line-clamp-1">
                  {course.title}
                </h1>
                <p className="text-sm text-gray-500">Course Overview</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/courses/${course.slug || courseId}`}
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </Link>
              
              <Link
                href={`/dashboard/instructor/courses/${courseId}/edit`}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>

              <Link
                href={`/dashboard/instructor/courses/${courseId}/curriculum`}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg font-semibold transition-colors text-sm"
              >
                <LayoutList className="w-4 h-4" />
                Curriculum
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8 space-y-8">
          {/* Course Info Card */}
          <div className="bg-slate-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Cover Image */}
              {course.coverImage && (
                <div className="lg:w-64 shrink-0">
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-full aspect-video object-cover rounded-lg border border-gray-700"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {course.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-gray-300 border border-gray-700 text-xs">
                    📚 {course.program?.title || 'No Program'}
                  </span>

                  <span
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      course.isPublished
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                        : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
                    }`}
                  >
                    {course.isPublished ? '✓ Published' : '⏳ Draft'}
                  </span>

                  <span
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      course.approvalStatus === 'approved'
                        ? 'bg-blue-400/10 text-blue-400 border-blue-400/30'
                        : course.approvalStatus === 'pending'
                        ? 'bg-orange-400/10 text-orange-400 border-orange-400/30'
                        : 'bg-red-400/10 text-red-400 border-red-400/30'
                    }`}
                  >
                    {course.approvalStatus === 'approved' && '✓ Approved'}
                    {course.approvalStatus === 'pending' && '⏳ Pending Review'}
                    {course.approvalStatus === 'rejected' && '✗ Rejected'}
                  </span>

                  {course.estimatedHours && (
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-gray-300 border border-gray-700 text-xs flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {course.estimatedHours}h
                    </span>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xl font-bold text-white">{modules?.length || 0}</div>
                    <div className="text-xs text-gray-500">Modules</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xl font-bold text-white">{totalLessons}</div>
                    <div className="text-xs text-gray-500">Lessons</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xl font-bold text-white">{totalStudents}</div>
                    <div className="text-xs text-gray-500">Students</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Layers}
              label="Total Modules"
              value={modules?.length || 0}
              subtext={`${publishedModules} published`}
              color="emerald"
            />
            <StatCard
              icon={BookOpen}
              label="Total Lessons"
              value={totalLessons}
              subtext="Across all modules"
              color="blue"
            />
            <StatCard
              icon={Users}
              label="Enrolled Students"
              value={totalStudents}
              subtext="Active learners"
              color="purple"
            />
            <StatCard
              icon={TrendingUp}
              label="Completion Rate"
              value={`${completionRate}%`}
              subtext="Module completion"
              color="lime"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <ActionCard
              icon={LayoutList}
              title="Curriculum Builder"
              description="Manage modules and lessons"
              href={`/dashboard/instructor/courses/${courseId}/curriculum`}
              color="emerald"
            />
            <ActionCard
              icon={Users}
              title="Student Management"
              description="View enrolled learners"
              href={`/dashboard/instructor/courses/${courseId}/students`}
              color="blue"
            />
            <ActionCard
              icon={BarChart3}
              title="Analytics"
              description="Performance insights"
              href={`/dashboard/instructor/courses/${courseId}/analytics`}
              color="purple"
            />
          </div>

          {/* Modules Overview */}
          <div className="bg-slate-900/50 border border-gray-800 rounded-2xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Course Modules</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {modules?.length || 0} module{modules?.length !== 1 ? 's' : ''} created
                </p>
              </div>
              <Link
                href={`/dashboard/instructor/courses/${courseId}/curriculum`}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                Manage All →
              </Link>
            </div>

            <div className="p-6">
              {!modules || modules.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No modules created yet</p>
                  <Link
                    href={`/dashboard/instructor/courses/${courseId}/curriculum`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg font-semibold text-sm transition-colors"
                  >
                    <LayoutList className="w-4 h-4" />
                    Create First Module
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {modules.slice(0, 5).map((module: any, index: number) => (
                    <Link
                      key={module._id}
                      href={`/dashboard/instructor/courses/${courseId}/curriculum`}
                      className="flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 border border-gray-700/50 hover:border-emerald-400/30 px-4 py-3 rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-gray-400 text-sm font-semibold group-hover:bg-emerald-400/10 group-hover:text-emerald-400 transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors truncate">
                            {module.title}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {module.description || 'No description'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-300">
                            {module.lessons?.length || 0} lessons
                          </div>
                          <div className="text-xs text-gray-500">
                            {module.isPublished ? (
                              <span className="text-emerald-400">Published</span>
                            ) : (
                              <span className="text-yellow-400">Draft</span>
                            )}
                          </div>
                        </div>
                        {module.isPublished ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                    </Link>
                  ))}

                  {modules.length > 5 && (
                    <Link
                      href={`/dashboard/instructor/courses/${courseId}/curriculum`}
                      className="block text-center py-3 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                    >
                      View all {modules.length} modules →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Reusable Components
function StatCard({ icon: Icon, label, value, subtext, color }: any) {
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    lime: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
  }

  return (
    <div className={`rounded-xl border ${colors} p-5`}>
      <Icon className={`w-7 h-7 ${colors} mb-3`} />
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400 mb-0.5">{label}</div>
      {subtext && <div className="text-xs text-gray-600">{subtext}</div>}
    </div>
  )
}

function ActionCard({ icon: Icon, title, description, href, color }: any) {
  const colors = {
    emerald: 'group-hover:border-emerald-400/30 group-hover:bg-emerald-400/5',
    blue: 'group-hover:border-blue-400/30 group-hover:bg-blue-400/5',
    purple: 'group-hover:border-purple-400/30 group-hover:bg-purple-400/5',
  }

  const iconColors = {
    emerald: 'text-emerald-400 bg-emerald-400/10 group-hover:bg-emerald-400/20',
    blue: 'text-blue-400 bg-blue-400/10 group-hover:bg-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 group-hover:bg-purple-400/20',
  }

  return (
    <Link
      href={href}
      className={`group bg-slate-900/50 border border-gray-800 ${colors} rounded-xl p-5 transition-all`}
    >
      <div className={`w-10 h-10 rounded-lg ${iconColors} flex items-center justify-center mb-4 transition-colors`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </Link>
  )
}