// components/modals/ModuleModal.tsx
'use client'

import { useState } from 'react'
import { moduleService } from '@/services/moduleService'
import { hybridAIService } from '@/services/hybridAIService'
import { X, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddModuleModalProps {
  courseId: string
  courseName: string
  courseDescription?: string
  onClose: () => void
  onCreated: () => void
}

export default function AddModuleModal({ 
  courseId, 
  courseName,
  courseDescription,
  onClose, 
  onCreated 
}: AddModuleModalProps) {
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'core' as 'core' | 'project' | 'assessment' | 'capstone',
    estimatedMinutes: '120',
    learningObjectives: [''],
    weekNumber: '1',
    sequenceLabel: 'Week 1',
  })

  // AI Generate Module Structure
  const handleAIGenerate = async () => {
    if (!form.title.trim()) {
      toast.error('Please enter a module title first')
      return
    }

    try {
      setAiGenerating(true)
      toast.loading('AI is generating module structure...', { id: 'ai-gen' })

      // Generate single module using the module generator
      const modules = await hybridAIService.generateModuleStructure(
        `${courseName} - ${form.title}`,
        1,
        courseDescription
      )

      if (modules && modules.length > 0) {
        const aiModule = modules[0]
        
        setForm(prev => ({
          ...prev,
          title: aiModule.title || prev.title,
          description: aiModule.description || prev.description,
          type: aiModule.type || prev.type,
          estimatedMinutes: aiModule.estimatedMinutes?.toString() || prev.estimatedMinutes,
          learningObjectives: aiModule.learningObjectives && aiModule.learningObjectives.length > 0 
            ? aiModule.learningObjectives 
            : prev.learningObjectives,
          weekNumber: aiModule.weekNumber?.toString() || prev.weekNumber,
          sequenceLabel: aiModule.sequenceLabel || prev.sequenceLabel,
        }))

        toast.success('AI generated module structure!', { id: 'ai-gen' })
      } else {
        toast.error('AI generation returned no results', { id: 'ai-gen' })
      }
    } catch (err: any) {
      console.error('AI generation error:', err)
      toast.error('Failed to generate with AI. Please fill manually.', { id: 'ai-gen' })
    } finally {
      setAiGenerating(false)
    }
  }

  const handleObjectiveChange = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) => 
        i === index ? value : obj
      )
    }))
  }

  const addObjective = () => {
    setForm(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }))
  }

  const removeObjective = (index: number) => {
    if (form.learningObjectives.length === 1) {
      toast.error('Module must have at least one learning objective')
      return
    }
    setForm(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
    }))
  }

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

    const filteredObjectives = form.learningObjectives.filter(obj => obj.trim())
    if (filteredObjectives.length === 0) {
      setError('At least one learning objective is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await moduleService.createModule({
        courseId: courseId,
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        estimatedMinutes: parseInt(form.estimatedMinutes) || 120,
        learningObjectives: filteredObjectives,
        weekNumber: parseInt(form.weekNumber) || undefined,
        sequenceLabel: form.sequenceLabel.trim() || undefined,
      })

      // Emit custom event for course page to listen to
      window.dispatchEvent(new CustomEvent('moduleCreated', { 
        detail: { 
          courseId,
          moduleId: res.data?._id 
        } 
      }))

      toast.success('Module created successfully!')
      onCreated()
      onClose()
    } catch (err: any) {
      console.error('Error creating module:', err)
      setError(err.response?.data?.error || err.message || 'Failed to create module')
      toast.error(err.response?.data?.error || 'Failed to create module')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl border border-gray-800 w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Add Module</h2>
            <p className="text-sm text-gray-400 mt-1">Create a new module for {courseName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            disabled={loading || aiGenerating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title with AI Button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">
                Module Title <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiGenerating || !form.title.trim()}
                className="flex items-center gap-2 px-3 py-1 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white text-xs rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    AI Generate
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Introduction to Python Basics"
              className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              disabled={loading || aiGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a title and click "AI Generate" to auto-fill
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of what this module covers..."
              rows={3}
              className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none resize-none"
              disabled={loading || aiGenerating}
            />
          </div>

          {/* Type and Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Module Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                disabled={loading || aiGenerating}
              >
                <option value="core">Core (Regular Content)</option>
                <option value="project">Project (Hands-on)</option>
                <option value="assessment">Assessment (Quiz/Test)</option>
                <option value="capstone">Capstone (Final Project)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Estimated Minutes
              </label>
              <input
                type="number"
                value={form.estimatedMinutes}
                onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })}
                placeholder="120"
                min="15"
                max="480"
                className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                disabled={loading || aiGenerating}
              />
            </div>
          </div>

          {/* Week Number and Sequence Label */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Week Number
              </label>
              <input
                type="number"
                value={form.weekNumber}
                onChange={(e) => setForm({ ...form, weekNumber: e.target.value })}
                placeholder="1"
                min="1"
                className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                disabled={loading || aiGenerating}
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Sequence Label
              </label>
              <input
                type="text"
                value={form.sequenceLabel}
                onChange={(e) => setForm({ ...form, sequenceLabel: e.target.value })}
                placeholder="Week 1 or Unit 1"
                className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                disabled={loading || aiGenerating}
              />
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">
                Learning Objectives <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={addObjective}
                className="text-emerald-400 hover:text-emerald-300 text-xs font-medium"
                disabled={loading || aiGenerating}
              >
                + Add Objective
              </button>
            </div>
            <div className="space-y-2">
              {form.learningObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    placeholder={`Objective ${index + 1}`}
                    className="flex-1 bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none text-sm"
                    disabled={loading || aiGenerating}
                  />
                  {form.learningObjectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="p-2 text-red-400 hover:text-red-300 transition"
                      disabled={loading || aiGenerating}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading || aiGenerating}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={create}
            disabled={loading || aiGenerating || !form.title.trim() || !form.description.trim()}
            className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Module'}
          </button>
        </div>
      </div>
    </div>
  )
}