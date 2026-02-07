// components/modals/ModuleModal.tsx
'use client'

import { useState } from 'react'
import { moduleService } from '@/services/moduleService'
import { X } from 'lucide-react'

export default function AddModuleModal({ courseId, onClose, onCreated }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
  })

  const create = async () => {
    // Validate required fields
    if (!form.title.trim()) {
      setError('Module title is required')
      return
    }

    if (!form.description.trim()) {
      setError('Module description is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await moduleService.createModule({
        course: courseId,
        title: form.title.trim(),
        description: form.description.trim(),
        order: 1, // Will be auto-incremented by backend if needed
      })

      onCreated()
      onClose()
    } catch (err: any) {
      console.error('Error creating module:', err)
      setError(err.response?.data?.error || err.message || 'Failed to create module')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-gray-800 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Add Module</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Module Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Introduction to Python"
              className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this module..."
              rows={3}
              className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none resize-none"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={create}
              disabled={loading || !form.title.trim() || !form.description.trim()}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Module'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}