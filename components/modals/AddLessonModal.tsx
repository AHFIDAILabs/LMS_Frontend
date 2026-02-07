'use client'

import { useState } from 'react'
import { lessonService } from '@/services/lessonService'
import { X, Upload, Loader2 } from 'lucide-react'

interface AddLessonModalProps {
  moduleId: string
  onClose: () => void
  onCreated: () => void
}

export default function AddLessonModal({
  moduleId,
  onClose,
  onCreated,
}: AddLessonModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'reading' | 'coding' | 'assignment',
    estimatedMinutes: '',
    content: '',
    isPreview: false,
    isRequired: true,
  })

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [documentFiles, setDocumentFiles] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate
      if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Build FormData
      const formData = new FormData()
      formData.append('module', moduleId)
      formData.append('title', form.title.trim())
      formData.append('description', form.description.trim())
      formData.append('type', form.type)
      formData.append('estimatedMinutes', form.estimatedMinutes || '0')
      formData.append('content', form.content.trim())
      formData.append('isPreview', form.isPreview.toString())
      formData.append('isRequired', form.isRequired.toString())
      formData.append('order', '1') // Will be auto-incremented by backend

      // Add video file
      if (videoFile) {
        formData.append('video', videoFile)
      }

      // Add document files
      documentFiles.forEach((file) => {
        formData.append('documents', file)
      })

      const res = await lessonService.createLesson(formData)

      if (res.success) {
        onCreated()
        onClose()
      } else {
        setError(res.error || 'Failed to create lesson')
      }
    } catch (err: any) {
      console.error('Error creating lesson:', err)
      setError(err.response?.data?.error || err.message || 'Failed to create lesson')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl border border-gray-800 w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Add Lesson</h2>
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
              placeholder="e.g., Introduction to Variables"
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
              placeholder="Brief description of the lesson..."
              rows={3}
              className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none resize-none"
              disabled={loading}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Lesson Type <span className="text-red-400">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as any })
                }
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
                placeholder="e.g., 15"
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
              placeholder="Main lesson content (supports markdown)..."
              rows={6}
              className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none resize-none font-mono text-sm"
              disabled={loading}
              required
            />
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            {/* Video Upload */}
            {form.type === 'video' && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Video File
                </label>
                <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white hover:bg-slate-700 transition">
                  <Upload className="w-4 h-4" />
                  {videoFile ? videoFile.name : 'Choose Video'}
                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                </label>
              </div>
            )}

            {/* Document Upload */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Documents/Resources
              </label>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white hover:bg-slate-700 transition">
                <Upload className="w-4 h-4" />
                {documentFiles.length > 0
                  ? `${documentFiles.length} file(s) selected`
                  : 'Choose Files'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  multiple
                  hidden
                  onChange={(e) =>
                    setDocumentFiles(Array.from(e.target.files || []))
                  }
                  disabled={loading}
                />
              </label>
            </div>
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
                className="w-4 h-4 bg-slate-800 border-gray-700 rounded text-emerald-400 focus:ring-emerald-400"
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
                className="w-4 h-4 bg-slate-800 border-gray-700 rounded text-emerald-400 focus:ring-emerald-400"
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
                  Creating...
                </>
              ) : (
                'Create Lesson'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}