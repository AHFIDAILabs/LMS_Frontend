'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import InstructorSidebar from '@/components/dashboard/InstructorSide'
import { lessonService } from '@/services/lessonService'
import { moduleService } from '@/services/moduleService'
import AddLessonModal from '@/components/modals/AddLessonModal'
import EditLessonModal from '@/components/modals/EditLessonModal'
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  FileText,
  Code,
  PenTool,
} from 'lucide-react'

export default function ManageLessonsPage() {
  const params = useParams()
  const router = useRouter()
  
  const courseId = params?.courseId as string
  const moduleId = params?.moduleId as string

  const [module, setModule] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)

  // Fetch module and lessons
  const fetchData = async () => {
    try {
      console.log('🔄 Fetching data for moduleId:', moduleId)
      setLoading(true)
      setError(null)

      const [moduleRes, lessonsRes] = await Promise.all([
        moduleService.getModule(moduleId),
        lessonService.getLessonsByModule(moduleId, true), // Include unpublished
      ])

      console.log('📦 Module Response:', moduleRes)
      console.log('📦 Lessons Response:', lessonsRes)

      if (moduleRes.success && lessonsRes.success) {
        const moduleData = moduleRes.data.module || moduleRes.data
        const lessonsData = lessonsRes.data
        
        console.log('✅ Module Data:', moduleData)
        console.log('✅ Lessons Data:', lessonsData)
        console.log('✅ Lessons Count:', lessonsData?.length || 0)
        
        setModule(moduleData)
        setLessons(Array.isArray(lessonsData) ? lessonsData : [])
      } else {
        console.error('❌ Failed response:', { moduleRes, lessonsRes })
        setError('Failed to load lessons')
      }
    } catch (err: any) {
      console.error('❌ Error fetching data:', err)
      console.error('Error details:', err.response?.data)
      setError(err.message || 'Failed to load lessons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (moduleId) {
      fetchData()
    }
  }, [moduleId])

  // Toggle lesson publish status
  const handleTogglePublish = async (lessonId: string) => {
    try {
      const res = await lessonService.togglePublish(lessonId)
      if (res.success) {
        setLessons((prev) =>
          prev.map((l) =>
            l._id === lessonId ? { ...l, isPublished: !l.isPublished } : l
          )
        )
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publish status')
    }
  }

  // Delete lesson
  const handleDelete = async (lessonId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this lesson? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      const res = await lessonService.deleteLesson(lessonId)
      if (res.success) {
        setLessons((prev) => prev.filter((l) => l._id !== lessonId))
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete lesson')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading lessons...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-2">
              Failed to load lessons
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

  const publishedCount = lessons.filter((l) => l.isPublished).length
  const totalMinutes = lessons.reduce((sum, l) => sum + (l.estimatedMinutes || 0), 0)

  console.log('📊 Current lessons state:', { 
    total: lessons.length, 
    publishedCount, 
    totalMinutes,
    lessons: lessons.map(l => ({ id: l._id, title: l.title, isPublished: l.isPublished }))
  })

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
                  onClick={() =>
                    router.push(`/dashboard/instructor/courses/${courseId}/curriculum`)
                  }
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-white">{module.title}</h1>
                  <p className="text-sm text-gray-500">Manage Lessons</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg font-semibold transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Lesson
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <BookOpen className="w-4 h-4" />
                <span>
                  {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{publishedCount} published</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{totalMinutes} min total</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {lessons.length === 0 ? (
            <div className="bg-slate-900/50 border border-gray-800 rounded-2xl p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No lessons yet</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Start adding lessons to this module. Lessons can include videos, text
                content, code examples, and assignments.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Lesson
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson._id}
                  lesson={lesson}
                  index={index}
                  onTogglePublish={() => handleTogglePublish(lesson._id)}
                  onEdit={() => setEditingLesson(lesson)}
                  onDelete={() => handleDelete(lesson._id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddLessonModal
          moduleId={moduleId}
          onClose={() => {
            console.log('🔒 Closing modal')
            setShowAddModal(false)
          }}
          onCreated={() => {
            console.log('✨ Lesson created callback triggered')
            fetchData()
          }}
        />
      )}

      {editingLesson && (
        <EditLessonModal
          lesson={editingLesson}
          onClose={() => setEditingLesson(null)}
          onUpdated={fetchData}
        />
      )}
    </div>
  )
}

// ============================================
// LESSON CARD COMPONENT
// ============================================
function LessonCard({ lesson, index, onTogglePublish, onEdit, onDelete }: any) {
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />
      case 'reading':
        return <FileText className="w-4 h-4" />
      case 'coding':
        return <Code className="w-4 h-4" />
      case 'assignment':
        return <PenTool className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
      case 'reading':
        return 'bg-purple-400/10 text-purple-400 border-purple-400/20'
      case 'coding':
        return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
      case 'assignment':
        return 'bg-red-400/10 text-red-400 border-red-400/20'
      default:
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20'
    }
  }

  return (
    <div className="bg-slate-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Drag Handle */}
          <div className="pt-1 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-gray-600" />
          </div>

          {/* Lesson Number */}
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 font-bold shrink-0">
            {index + 1}
          </div>

          {/* Lesson Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                  {lesson.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {lesson.description}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 shrink-0">
                {lesson.isPublished ? (
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

            {/* Lesson Stats */}
            <div className="flex items-center gap-3 text-xs mb-4">
              <span
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${getTypeColor(
                  lesson.type
                )}`}
              >
                {getLessonIcon(lesson.type)}
                <span className="capitalize">{lesson.type}</span>
              </span>

              {lesson.estimatedMinutes && (
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {lesson.estimatedMinutes} min
                </span>
              )}

              {lesson.isRequired && (
                <span className="px-2 py-1 rounded bg-slate-800 text-gray-400 text-xs">
                  Required
                </span>
              )}

              {lesson.isPreview && (
                <span className="px-2 py-1 rounded bg-lime-400/10 text-lime-400 text-xs">
                  Preview
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>

              <button
                onClick={onTogglePublish}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors"
                title={lesson.isPublished ? 'Unpublish' : 'Publish'}
              >
                {lesson.isPublished ? (
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