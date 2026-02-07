'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import InstructorSidebar from '@/components/dashboard/InstructorSide'
import { courseService } from '@/services/courseService'
import { usePrograms } from '@/hooks/useProgram'
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
  Trash2,
  Image as ImageIcon,
  X,
} from 'lucide-react'

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.courseId as string

  const { programs, loading: programsLoading } = usePrograms({ isPublished: true })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [removeCover, setRemoveCover] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    program: '',
    estimatedHours: '',
    targetAudience: '',
    objectives: [''],
    prerequisites: [''],
    level: [] as string[],
  })

  useEffect(() => {
    if (!courseId) return

    const fetchCourse = async () => {
      try {
        setLoading(true)
        const res = await courseService.getCourseById(courseId)
        
        if (res.success && res.data) {
          const course = res.data
          setForm({
            title: course.title || '',
            description: course.description || '',
            program:
  typeof course.program === 'string'
    ? course.program
    : course.program?._id ?? '',

            estimatedHours: course.estimatedHours?.toString() || '',
            targetAudience: course.targetAudience || '',
            objectives: course.objectives?.length > 0 ? course.objectives : [''],
            prerequisites: course.prerequisites?.length > 0 ? course.prerequisites : [''],
            level: course.level || [],
          })
          
          if (course.coverImage) {
            setCoverPreview(course.coverImage)
          }
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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleArrayChange = (type: 'objectives' | 'prerequisites', index: number, value: string) => {
    const updated = [...form[type]]
    updated[index] = value
    setForm({ ...form, [type]: updated })
  }

  const addField = (type: 'objectives' | 'prerequisites') => {
    setForm({ ...form, [type]: [...form[type], ''] })
  }

  const removeField = (type: 'objectives' | 'prerequisites', index: number) => {
    const updated = form[type].filter((_, i) => i !== index)
    setForm({ ...form, [type]: updated.length > 0 ? updated : [''] })
  }

  const handleLevelToggle = (level: string) => {
    const updated = form.level.includes(level)
      ? form.level.filter(l => l !== level)
      : [...form.level, level]
    setForm({ ...form, level: updated })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setRemoveCover(false)
  }

  const handleRemoveImage = () => {
    setCoverFile(null)
    setCoverPreview(null)
    setRemoveCover(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!form.title.trim()) {
        setError('Course title is required')
        setSaving(false)
        return
      }

      if (!form.description.trim()) {
        setError('Description is required')
        setSaving(false)
        return
      }

      if (!form.program) {
        setError('Please select a program')
        setSaving(false)
        return
      }

      if (!form.targetAudience.trim()) {
        setError('Target audience is required')
        setSaving(false)
        return
      }

      // Prepare data
      if (coverFile) {
        // With new image - use FormData
        const formData = new FormData()
        formData.append('title', form.title.trim())
        formData.append('description', form.description.trim())
        formData.append('program', form.program)
        formData.append('targetAudience', form.targetAudience.trim())
        
        if (form.estimatedHours) {
          formData.append('estimatedHours', form.estimatedHours)
        }

        const objectives = form.objectives.filter(Boolean)
        if (objectives.length > 0) {
          formData.append('objectives', JSON.stringify(objectives))
        }

        const prerequisites = form.prerequisites.filter(Boolean)
        if (prerequisites.length > 0) {
          formData.append('prerequisites', JSON.stringify(prerequisites))
        }

        if (form.level.length > 0) {
          formData.append('level', JSON.stringify(form.level))
        }

        formData.append('coverImage', coverFile)

        const res = await courseService.updateCourse(courseId, formData)

        if (res.success) {
          setSuccess(true)
          setTimeout(() => {
            router.push(`/dashboard/instructor/courses/${courseId}`)
          }, 1500)
        } else {
          setError(res.error || 'Failed to update course')
        }
      } else {
        // No new image - use JSON
        const payload: any = {
          title: form.title.trim(),
          description: form.description.trim(),
          program: form.program,
          targetAudience: form.targetAudience.trim(),
          estimatedHours: Number(form.estimatedHours) || 0,
          objectives: form.objectives.filter(Boolean),
          prerequisites: form.prerequisites.filter(Boolean),
          level: form.level,
        }

        // Handle cover image removal
        if (removeCover) {
          payload.coverImage = null
        }

        const res = await courseService.updateCourse(courseId, payload)

        if (res.success) {
          setSuccess(true)
          setTimeout(() => {
            router.push(`/dashboard/instructor/courses/${courseId}`)
          }, 1500)
        } else {
          setError(res.error || 'Failed to update course')
        }
      }
    } catch (err: any) {
      console.error('❌ Error:', err)
      setError(err.response?.data?.error || err.message || 'Failed to update course')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex">
        <InstructorSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading course...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <InstructorSidebar />

      <div className="flex-1 ml-64">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur border-b border-gray-800">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/instructor/courses/${courseId}`)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                disabled={saving}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">Edit Course</h1>
                <p className="text-sm text-gray-500">Update course information</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/instructor/courses/${courseId}`)}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
                disabled={saving}
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 rounded-lg font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-4 rounded-lg flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium">Course updated successfully! Redirecting...</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Failed to update course</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-slate-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>

                <div className="space-y-5">
                  <Input
                    label="Course Title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Introduction to Machine Learning"
                  />

                  <Textarea
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    placeholder="Describe what students will learn..."
                  />

                  <Select
                    label="Program"
                    name="program"
                    value={form.program}
                    onChange={handleChange}
                    disabled={programsLoading}
                    required
                    options={programs.map(p => ({ value: p._id, label: p.title }))}
                  />

                  <div className="grid md:grid-cols-2 gap-5">
                    <Input
                      label="Target Audience"
                      name="targetAudience"
                      value={form.targetAudience}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Beginners with basic programming"
                    />

                    <Input
                      label="Estimated Hours"
                      name="estimatedHours"
                      type="number"
                      value={form.estimatedHours}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g., 40"
                    />
                  </div>
                </div>
              </div>

              {/* Course Level */}
              <div className="bg-slate-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Course Level</h2>
                <p className="text-sm text-gray-400 mb-4">Select all that apply</p>

                <div className="flex flex-wrap gap-3">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleLevelToggle(level)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        form.level.includes(level)
                          ? 'bg-emerald-400 text-slate-900'
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="bg-slate-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Learning Objectives</h2>
                
                <DynamicList
                  items={form.objectives}
                  onChange={(i: any, v: any) => handleArrayChange('objectives', i, v)}
                  onAdd={() => addField('objectives')}
                  onRemove={(i: any) => removeField('objectives', i)}
                  placeholder="e.g., Understand machine learning fundamentals"
                />
              </div>

              {/* Prerequisites */}
              <div className="bg-slate-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Prerequisites</h2>
                
                <DynamicList
                  items={form.prerequisites}
                  onChange={(i: any, v: any) => handleArrayChange('prerequisites', i, v)}
                  onAdd={() => addField('prerequisites')}
                  onRemove={(i: any) => removeField('prerequisites', i)}
                  placeholder="e.g., Basic Python programming"
                />
              </div>

              {/* Cover Image */}
              <div className="bg-slate-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Cover Image</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Recommended: 1280×720 or larger
                </p>

                {coverPreview && !removeCover ? (
                  <div className="relative inline-block">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white hover:bg-slate-700 transition">
                    <ImageIcon className="w-4 h-4" />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              {/* Submit Button (Mobile) */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-slate-900 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

/* ---------------- Reusable UI Components ---------------- */

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-400 mb-2 block">
      {label} {props.required && <span className="text-red-400">*</span>}
    </label>
    <input
      {...props}
      className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-400 focus:outline-none transition placeholder:text-gray-500"
    />
  </div>
)

const Textarea = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-400 mb-2 block">
      {label} {props.required && <span className="text-red-400">*</span>}
    </label>
    <textarea
      {...props}
      rows={4}
      className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-400 focus:outline-none transition resize-none placeholder:text-gray-500"
    />
  </div>
)

const Select = ({ label, options, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-400 mb-2 block">
      {label} {props.required && <span className="text-red-400">*</span>}
    </label>
    <select
      {...props}
      className="w-full bg-slate-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-400 focus:outline-none transition"
    >
      <option value="">Select a program</option>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
)

const DynamicList = ({ items, onChange, onAdd, onRemove, placeholder }: any) => (
  <div className="space-y-3">
    {items.map((item: string, i: number) => (
      <div key={i} className="flex gap-2">
        <input
          value={item}
          onChange={(e) => onChange(i, e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-slate-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-400 focus:outline-none transition placeholder:text-gray-500"
        />
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="px-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    ))}
    <button
      type="button"
      onClick={onAdd}
      className="text-emerald-400 text-sm hover:text-emerald-300 transition font-medium"
    >
      + Add Item
    </button>
  </div>
)