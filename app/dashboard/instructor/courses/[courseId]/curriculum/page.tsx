'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import InstructorSidebar from '@/components/dashboard/InstructorSide'
import { instructorService } from '@/services/instructorService'
import { moduleService } from '@/services/moduleService'
import AddModuleModal from '@/components/modals/ModuleModal'
import EditModuleModal from '@/components/modals/EditModuleModal'
import {
  ArrowLeft,
  Plus,
  Layers,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
} from 'lucide-react'

export default function CurriculumPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string

  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingModule, setEditingModule] = useState<any>(null)
  const [deletingModule, setDeletingModule] = useState<any>(null)

  // Fetch course and modules
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [courseRes, modulesRes] = await Promise.all([
        instructorService.getCourse(courseId),
        moduleService.getModulesByCourse(courseId, true), // Include unpublished
      ])

      if (courseRes.success && modulesRes.success) {
        setCourse(courseRes.data.course)
        setModules(modulesRes.data)
      } else {
        setError('Failed to load curriculum')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to load curriculum')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) {
      fetchData()
    }
  }, [courseId])

  // Toggle module publish status
  const handleTogglePublish = async (moduleId: string) => {
    try {
      const res = await moduleService.togglePublish(moduleId)
      if (res.success) {
        // Update local state
        setModules((prev) =>
          prev.map((m) =>
            m._id === moduleId ? { ...m, isPublished: !m.isPublished } : m
          )
        )
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publish status')
    }
  }

  // Delete module
  const handleDelete = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return
    }

    try {
      const res = await moduleService.deleteModule(moduleId)
      if (res.success) {
        setModules((prev) => prev.filter((m) => m._id !== moduleId))
        setDeletingModule(null)
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete module')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading curriculum...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-2">Failed to load curriculum</p>
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

  const publishedCount = modules.filter((m) => m.isPublished).length
  const totalLessons = modules.reduce((sum, m) => sum + (m.stats?.lessonCount || 0), 0)

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <InstructorSidebar />

      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur border-b border-gray-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/dashboard/instructor/courses/${courseId}`)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-white">{course.title}</h1>
                  <p className="text-sm text-gray-500">Course Curriculum</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg font-semibold transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Module
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Layers className="w-4 h-4" />
                <span>
                  {modules.length} module{modules.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{publishedCount} published</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <BookOpen className="w-4 h-4" />
                <span>{totalLessons} lessons</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {modules.length === 0 ? (
            <div className="bg-slate-900/50 border border-gray-800 rounded-2xl p-12 text-center">
              <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No modules yet</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Start building your course by creating modules. Each module can contain multiple
                lessons.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Module
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => (
                <ModuleCard
                  key={module._id}
                  module={module}
                  index={index}
                  courseId={courseId}
                  onTogglePublish={() => handleTogglePublish(module._id)}
                  onEdit={() => setEditingModule(module)}
                  onDelete={() => handleDelete(module._id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddModuleModal
          courseId={courseId}
          onClose={() => setShowAddModal(false)}
          onCreated={fetchData}
        />
      )}

      {editingModule && (
        <EditModuleModal
          module={editingModule}
          onClose={() => setEditingModule(null)}
          onUpdated={fetchData}
        />
      )}
    </div>
  )
}

// ============================================
// MODULE CARD COMPONENT
// ============================================
function ModuleCard({ module, index, courseId, onTogglePublish, onEdit, onDelete }: any) {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  const lessonCount = module.stats?.lessonCount || 0
  const totalMinutes = module.stats?.totalMinutes || 0

  return (
    <div className="bg-slate-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all">
      {/* Module Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Drag Handle */}
          <div className="pt-1 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-gray-600" />
          </div>

          {/* Module Number */}
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 font-bold shrink-0">
            {index + 1}
          </div>

          {/* Module Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">{module.description}</p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 shrink-0">
                {module.isPublished ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Published
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-xs font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Draft
                  </span>
                )}
              </div>
            </div>

            {/* Module Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
              </span>
              {totalMinutes > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.round(totalMinutes)} min
                </span>
              )}
              {module.type && module.type !== 'core' && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-gray-400 capitalize">
                  {module.type}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/instructor/courses/${courseId}/modules/${module._id}/lessons`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Manage Lessons
              </Link>

              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>

              <button
                onClick={onTogglePublish}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors"
                title={module.isPublished ? 'Unpublish' : 'Publish'}
              >
                {module.isPublished ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Publish
                  </>
                )}
              </button>

              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg text-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}