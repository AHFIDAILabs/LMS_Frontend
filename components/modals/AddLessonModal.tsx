'use client'

import { useState } from 'react'
import { lessonService } from '@/services/lessonService'
import { X, Upload, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import AIAssistant from '@/components/ai/AIAssistant'

interface AddLessonModalProps {
  moduleId: string
  onClose: () => void
  onCreated: () => void
}

export default function AddLessonModal({ moduleId, onClose, onCreated }: AddLessonModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    estimatedMinutes: 30,
    content: '',
    order: '',
    learningObjectives: [''],
    codeExamples: [''],
    assignments: [''],
    isPreview: false,
    isRequired: true,
    completionRule: {
      type: 'view' as 'view' | 'quiz_pass' | 'assignment_submit' | 'project_review',
      passingScore: undefined as number | undefined
    }
  })

  const [files, setFiles] = useState({
    video: [] as File[],
    documents: [] as File[],
    slides: [] as File[],
    resources: [] as File[]
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formDataToSend = new FormData()
      
      // Required fields - send as plain strings/numbers, NOT JSON
      formDataToSend.append('module', moduleId)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('type', formData.type)
      formDataToSend.append('estimatedMinutes', formData.estimatedMinutes.toString())
      formDataToSend.append('content', formData.content)
      
      // Optional fields
      formDataToSend.append('order', formData.order.toString())
      formDataToSend.append('isPreview', formData.isPreview.toString())
      formDataToSend.append('isRequired', formData.isRequired.toString())
      
      // Arrays - send as JSON strings (controller will parse them)
      const learningObjectives = formData.learningObjectives.filter(obj => obj.trim())
      const codeExamples = formData.codeExamples.filter(ex => ex.trim())
      const assignments = formData.assignments.filter(a => a.trim())
      
      if (learningObjectives.length > 0) {
        formDataToSend.append('learningObjectives', JSON.stringify(learningObjectives))
      }
      if (codeExamples.length > 0) {
        formDataToSend.append('codeExamples', JSON.stringify(codeExamples))
      }
      if (assignments.length > 0) {
        formDataToSend.append('assignments', JSON.stringify(assignments))
      }
      
      // Completion rule as JSON
      formDataToSend.append('completionRule', JSON.stringify(formData.completionRule))

      // Add files with proper field names matching controller expectations
      files.video.forEach(file => formDataToSend.append('video', file))
      files.documents.forEach(file => formDataToSend.append('documents', file))
      files.slides.forEach(file => formDataToSend.append('slides', file))
      files.resources.forEach(file => formDataToSend.append('resources', file))

      console.log('📤 Submitting lesson data:', {
        module: moduleId,
        title: formData.title,
        type: formData.type,
        estimatedMinutes: formData.estimatedMinutes,
        learningObjectivesCount: learningObjectives.length,
        hasFiles: {
          video: files.video.length,
          documents: files.documents.length,
          slides: files.slides.length,
          resources: files.resources.length
        }
      })

      const res = await lessonService.createLesson(formDataToSend)
      
      console.log('✅ Lesson created:', res)
      
    // In AddLessonModal.tsx, update the success handler:

if (res.success) {
  setSuccess(true)
  console.log('✅ Lesson created successfully, calling callbacks')
  
  // Extract courseId from the URL params
  const pathParts = window.location.pathname.split('/')
  const courseIdFromPath = pathParts[pathParts.indexOf('courses') + 1]
  
  // Emit custom event for course page to listen to
  window.dispatchEvent(new CustomEvent('lessonCreated', { 
    detail: { 
      courseId: courseIdFromPath,
      moduleId,
      lessonId: res.data._id 
    } 
  }))
  
  // Call onCreated first to refresh data
  onCreated()
  
  // Then close after a short delay to show success
  setTimeout(() => {
    onClose()
  }, 500)
} else {
        setError(res.error || 'Failed to create lesson')
      }
    } catch (err: any) {
      console.error('❌ Error creating lesson:', err)
      console.error('Error response:', err.response?.data)
      setError(err.response?.data?.error || err.message || 'Failed to create lesson')
    } finally {
      setLoading(false)
    }
  }

  // AI Assistant handler
  const handleApplyAISuggestion = (suggestion: any) => {
    console.log('🤖 Applying AI suggestion:', suggestion)
    
    // Update form data with AI suggestions
    setFormData(prev => ({
      ...prev,
      ...(suggestion.title && { title: suggestion.title }),
      ...(suggestion.description && { description: suggestion.description }),
      ...(suggestion.content && { content: suggestion.content }),
      ...(suggestion.learningObjectives && { learningObjectives: suggestion.learningObjectives }),
      ...(suggestion.estimatedMinutes && { estimatedMinutes: suggestion.estimatedMinutes }),
      ...(suggestion.type && { type: suggestion.type }),
      ...(suggestion.codeExamples && { codeExamples: suggestion.codeExamples }),
      ...(suggestion.assignments && { assignments: suggestion.assignments }),
    }))
  }

  // Learning Objectives handlers
  const addLearningObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }))
  }

  const updateLearningObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: prev.learningObjectives.map((obj, i) => i === index ? value : obj)
    }))
  }

  const removeLearningObjective = (index: number) => {
    if (formData.learningObjectives.length > 1) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
      }))
    }
  }

  // Code Examples handlers
  const addCodeExample = () => {
    setFormData(prev => ({
      ...prev,
      codeExamples: [...prev.codeExamples, '']
    }))
  }

  const updateCodeExample = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      codeExamples: prev.codeExamples.map((ex, i) => i === index ? value : ex)
    }))
  }

  const removeCodeExample = (index: number) => {
    if (formData.codeExamples.length > 1) {
      setFormData(prev => ({
        ...prev,
        codeExamples: prev.codeExamples.filter((_, i) => i !== index)
      }))
    }
  }

  // Assignments handlers
  const addAssignment = () => {
    setFormData(prev => ({
      ...prev,
      assignments: [...prev.assignments, '']
    }))
  }

  const updateAssignment = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      assignments: prev.assignments.map((a, i) => i === index ? value : a)
    }))
  }

  const removeAssignment = (index: number) => {
    if (formData.assignments.length > 1) {
      setFormData(prev => ({
        ...prev,
        assignments: prev.assignments.filter((_, i) => i !== index)
      }))
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-slate-900 rounded-2xl max-w-4xl w-full my-8">
          {/* Modal header */}
          <div className="sticky top-0 bg-slate-900 border-b border-gray-800 p-6 flex items-center justify-between rounded-t-2xl z-10">
            <div>
              <h2 className="text-xl font-bold text-white">Add New Lesson</h2>
              <p className="text-sm text-gray-400 mt-1">
                Create a new lesson for this module
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-100px)] overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold">Error Creating Lesson</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-400 font-semibold">Lesson Created!</p>
                  <p className="text-emerald-300 text-sm mt-1">Redirecting...</p>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Lesson Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="e.g., Introduction to React Hooks"
                  required
                  disabled={loading}
                />
              </div>

              {/* Type & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Lesson Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                    disabled={loading}
                  >
                    <option value="video">Video Lesson</option>
                    <option value="reading">Reading Material</option>
                    <option value="coding">Coding Exercise</option>
                    <option value="workshop">Workshop</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Estimated Duration (minutes) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
                    min="1"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors resize-none"
                  rows={3}
                  placeholder="Brief description of what students will learn"
                  required
                  disabled={loading}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Lesson Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors resize-none font-mono text-sm"
                  rows={8}
                  placeholder="Main lesson content (supports markdown)..."
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Markdown formatting supported
                </p>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white">
                  Learning Objectives (Optional)
                </label>
                <button
                  type="button"
                  onClick={addLearningObjective}
                  className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                  Add Objective
                </button>
              </div>
              <div className="space-y-2">
                {formData.learningObjectives.map((obj, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => updateLearningObjective(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                      placeholder={`Objective ${index + 1}`}
                      disabled={loading}
                    />
                    {formData.learningObjectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLearningObjective(index)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Code Examples (only show for coding type) */}
            {formData.type === 'coding' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">
                    Code Examples (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addCodeExample}
                    className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4" />
                    Add Example
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.codeExamples.map((example, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={example}
                        onChange={(e) => updateCodeExample(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors font-mono text-sm resize-none"
                        rows={4}
                        placeholder="Code snippet..."
                        disabled={loading}
                      />
                      {formData.codeExamples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCodeExample(index)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors h-fit"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assignments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white">
                  Assignments (Optional)
                </label>
                <button
                  type="button"
                  onClick={addAssignment}
                  className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                  Add Assignment
                </button>
              </div>
              <div className="space-y-2">
                {formData.assignments.map((assignment, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={assignment}
                      onChange={(e) => updateAssignment(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm"
                      placeholder={`Assignment ${index + 1}`}
                      disabled={loading}
                    />
                    {formData.assignments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAssignment(index)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Resources (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video Files
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => setFiles(prev => ({ ...prev, video: Array.from(e.target.files || []) }))}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-400 file:text-slate-900 hover:file:bg-emerald-500 file:cursor-pointer"
                    disabled={loading}
                  />
                  {files.video.length > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      {files.video.length} file(s) selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Documents (PDF)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => setFiles(prev => ({ ...prev, documents: Array.from(e.target.files || []) }))}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-400 file:text-slate-900 hover:file:bg-emerald-500 file:cursor-pointer"
                    disabled={loading}
                  />
                  {files.documents.length > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      {files.documents.length} file(s) selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slides (PPT, PDF)
                  </label>
                  <input
                    type="file"
                    accept=".ppt,.pptx,.pdf"
                    multiple
                    onChange={(e) => setFiles(prev => ({ ...prev, slides: Array.from(e.target.files || []) }))}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-400 file:text-slate-900 hover:file:bg-emerald-500 file:cursor-pointer"
                    disabled={loading}
                  />
                  {files.slides.length > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      {files.slides.length} file(s) selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Other Resources
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(prev => ({ ...prev, resources: Array.from(e.target.files || []) }))}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-400 file:text-slate-900 hover:file:bg-emerald-500 file:cursor-pointer"
                    disabled={loading}
                  />
                  {files.resources.length > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      {files.resources.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Settings</h3>
              
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPreview}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPreview: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-700 text-emerald-400 focus:ring-emerald-400 focus:ring-offset-slate-900"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-300">
                    Preview (Allow free access)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-700 text-emerald-400 focus:ring-emerald-400 focus:ring-offset-slate-900"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-300">
                    Required for completion
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Completion Rule
                </label>
                <select
                  value={formData.completionRule.type}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    completionRule: { 
                      ...prev.completionRule, 
                      type: e.target.value as any 
                    } 
                  }))}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  disabled={loading}
                >
                  <option value="view">Just view the lesson</option>
                  <option value="quiz_pass">Pass a quiz</option>
                  <option value="assignment_submit">Submit assignment</option>
                  <option value="project_review">Project review</option>
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : success ? 'Created!' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI Assistant - positioned outside the modal */}
      <AIAssistant
        context="lesson"
        onApplySuggestion={handleApplyAISuggestion}
        contextData={{
          topic: formData.title,
          duration: formData.estimatedMinutes,
          type: formData.type,
          content: formData.content
        }}
      />
    </>
  )
}