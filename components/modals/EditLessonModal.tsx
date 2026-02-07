'use client'

import { useState } from 'react'
import { lessonService } from '@/services/lessonService'
import { X, Loader2 } from 'lucide-react'

interface EditLessonModalProps {
  lesson: any
  onClose: () => void
  onUpdated: () => void
}

export default function EditLessonModal({
  lesson,
  onClose,
  onUpdated,
}: EditLessonModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: lesson.title || '',
    description: lesson.description || '',
    type: lesson.type || 'video',
    estimatedMinutes: lesson.estimatedMinutes?.toString() || '',
    content: lesson.content || '',
    isPreview: lesson.isPreview || false,
    isRequired: lesson.isRequired !== undefined ? lesson.isRequired : true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        estimatedMinutes: Number(form.estimatedMinutes) || 0,
        content: form.content.trim(),
        isPreview: form.isPreview,
        isRequired: form.isRequired,
      }

      const res = await lessonService.updateLesson(lesson._id, payload)

      if (res.success) {
        onUpdated()
        onClose()
      } else {
        setError(res.error || 'Failed to update lesson')
      }
    } catch (err: any) {
      console.error('Error updating lesson:', err)
      setError(err.response?.data?.error || err.message || 'Failed to update lesson')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl border border-gray-800 w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Edit Lesson</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Lesson Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none resize-none"
              disabled={loading}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                disabled={loading}
              >
                <option value="video">Video</option>
                <option value="reading">Reading</option>
                <option value="coding">Coding Exercise</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Estimated Minutes
              </label>
              <input
                type="number"
                value={form.estimatedMinutes}
                onChange={(e) =>
                  setForm({ ...form, estimatedMinutes: e.target.value })
                }
                min="0"
                className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none resize-none font-mono text-sm"
              disabled={loading}
              required
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isRequired}
                onChange={(e) =>
                  setForm({ ...form, isRequired: e.target.checked })
                }
                className="w-4 h-4 bg-slate-800 border-gray-700 rounded text-emerald-400"
                disabled={loading}
              />
              <span className="text-sm text-gray-300">Required Lesson</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPreview}
                onChange={(e) =>
                  setForm({ ...form, isPreview: e.target.checked })
                }
                className="w-4 h-4 bg-slate-800 border-gray-700 rounded text-emerald-400"
                disabled={loading}
              />
              <span className="text-sm text-gray-300">Free Preview</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Lesson'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}