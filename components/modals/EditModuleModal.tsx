// components/modals/EditModuleModal.tsx
'use client'

import { useState } from 'react'
import { moduleService } from '@/services/moduleService'
import { X } from 'lucide-react'

export default function EditModuleModal({ module, onClose, onUpdated }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: module.title || '',
    description: module.description || '',
    sequenceLabel: module.sequenceLabel || '',
    estimatedMinutes: module.estimatedMinutes || '',
    type: module.type || 'core',
    learningObjectives: module.learningObjectives || [''],
  })

  const handleArrayChange = (index: number, value: string) => {
    const updated = [...form.learningObjectives]
    updated[index] = value
    setForm({ ...form, learningObjectives: updated })
  }

  const addObjective = () => {
    setForm({ ...form, learningObjectives: [...form.learningObjectives, ''] })
  }

  const removeObjective = (index: number) => {
    const updated = form.learningObjectives.filter((_: any, i: any) => i !== index)
    setForm({ ...form, learningObjectives: updated })
  }

  const update = async () => {
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

      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
      }

      if (form.sequenceLabel?.trim()) {
        payload.sequenceLabel = form.sequenceLabel.trim()
      }

      if (form.estimatedMinutes) {
        payload.estimatedMinutes = Number(form.estimatedMinutes)
      }

      const validObjectives = form.learningObjectives.filter((obj: any) => obj.trim() !== '')
      if (validObjectives.length > 0) {
        payload.learningObjectives = validObjectives
      }

      await moduleService.updateModule(module._id, payload)

      onUpdated()
      onClose()
    } catch (err: any) {
      console.error('Error updating module:', err)
      setError(err.message || 'Failed to update module')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Edit Module</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Sequence Label</label>
              <input
                type="text"
                value={form.sequenceLabel}
                onChange={(e) => setForm({ ...form, sequenceLabel: e.target.value })}
                placeholder="e.g., Week 1"
                className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Optional: e.g., "Week 1" or "Module 1"</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Estimated Minutes</label>
              <input
                type="number"
                value={form.estimatedMinutes}
                onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })}
                placeholder="e.g., 180"
                min="0"
                className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Total time to complete</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Module Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              disabled={loading}
            >
              <option value="core">Core</option>
              <option value="supplementary">Supplementary</option>
              <option value="project">Project</option>
              <option value="assessment">Assessment</option>
            </select>
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Learning Objectives</label>
            <div className="space-y-2">
              {form.learningObjectives.map((objective: any, index: any) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={objective}
                    onChange={(e) => handleArrayChange(index, e.target.value)}
                    placeholder="e.g., Understand Python basics"
                    className="flex-1 bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                    disabled={loading}
                  />
                  {form.learningObjectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="px-3 text-red-400 hover:text-red-300 transition"
                      disabled={loading}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="text-emerald-400 text-sm hover:text-emerald-300 transition"
                disabled={loading}
              >
                + Add Learning Objective
              </button>
            </div>
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
              onClick={update}
              disabled={loading || !form.title.trim() || !form.description.trim()}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Module'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}