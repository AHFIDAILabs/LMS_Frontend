'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InstructorSidebar from '@/components/dashboard/InstructorSide'
import { usePrograms } from '@/hooks/useProgram'
import { instructorService } from '@/services/instructorService'
import { hybridAIService } from '@/services/hybridAIService'
import { Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateCoursePage() {
  const router = useRouter()
  const { programs, loading: programsLoading } = usePrograms({ isPublished: true })

  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    programId: '',
    hours: '',
    targetAudience: '',
    objectives: [''],
    prerequisites: [''],
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    console.log(`📝 Field changed: ${name} = ${value}`)
    setForm({ ...form, [name]: value })
  }

  const handleArrayChange = (type: 'objectives' | 'prerequisites', index: number, value: string) => {
    const updated = [...form[type]]
    updated[index] = value
    setForm({ ...form, [type]: updated })
  }

  const addField = (type: 'objectives' | 'prerequisites') =>
    setForm({ ...form, [type]: [...form[type], ''] })

  const removeField = (type: 'objectives' | 'prerequisites', index: number) => {
    const updated = form[type].filter((_, i) => i !== index)
    setForm({ ...form, [type]: updated })
  }

  // AI Generate Course Structure
  const handleAIGenerate = async () => {
    if (!form.title.trim()) {
      toast.error('Please enter a course title first')
      return
    }

    if (!form.programId) {
      toast.error('Please select a program first')
      return
    }

    try {
      setAiGenerating(true)
      toast.loading('AI is generating course structure...', { id: 'ai-gen' })

      // Get selected program for context
      const selectedProgram = programs.find(p => p._id === form.programId)
      const programContext = selectedProgram 
        ? `This course is part of the "${selectedProgram.title}" program. ${selectedProgram.description || ''}`
        : ''

      const aiResult = await hybridAIService.generateCourseStructure(
        form.title,
        programContext,
        form.description || undefined,
        form.hours ? parseInt(form.hours) : undefined
      )

      // Update form with AI suggestions
      setForm(prev => ({
        ...prev,
        title: aiResult.title || prev.title,
        description: aiResult.description || prev.description,
        hours: aiResult.estimatedHours?.toString() || prev.hours,
        targetAudience: aiResult.targetAudience || prev.targetAudience,
        objectives: aiResult.objectives && aiResult.objectives.length > 0 
          ? aiResult.objectives 
          : prev.objectives,
        prerequisites: aiResult.prerequisites && aiResult.prerequisites.length > 0 
          ? aiResult.prerequisites 
          : prev.prerequisites,
      }))

      toast.success('AI generated course structure!', { id: 'ai-gen' })
      
      // Show learning objectives if available
      if (aiResult.objectives) {
        toast.success(
          `Learning Objectives:\n${aiResult.objectives.slice(0, 3).join('\n')}`,
          { duration: 5000 }
        )
      }
    } catch (err: any) {
      console.error('AI generation error:', err)
      toast.error('Failed to generate with AI. Please fill manually.', { id: 'ai-gen' })
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Form state before submit:', form)
      
      // Validate required fields
      if (!form.title.trim()) {
        setError('Course title is required')
        setLoading(false)
        return
      }
      
      if (!form.description.trim()) {
        setError('Description is required')
        setLoading(false)
        return
      }
      
      if (!form.programId) {
        console.error('❌ Program not selected!')
        setError('Please select a program')
        setLoading(false)
        return
      }
      
      if (!form.targetAudience.trim()) {
        setError('Target audience is required')
        setLoading(false)
        return
      }

      // Generate slug from title
      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      console.log('🔍 Generated slug:', slug)

      // Always use FormData (backend expects multipart/form-data)
      const formData = new FormData()

      // CRITICAL: Backend expects 'program' not 'programId'
      formData.append('program', form.programId)
      formData.append('title', form.title.trim())
      formData.append('slug', slug)
      formData.append('description', form.description.trim())
      formData.append('targetAudience', form.targetAudience.trim())
      formData.append('order', '1')

      if (form.hours && form.hours.trim()) {
        formData.append('estimatedHours', form.hours)
      }

      // Filter out empty objectives and prerequisites
      const validObjectives = form.objectives.filter(obj => obj.trim() !== '')
      const validPrerequisites = form.prerequisites.filter(pre => pre.trim() !== '')

      formData.append('objectives', JSON.stringify(validObjectives))
      formData.append('prerequisites', JSON.stringify(validPrerequisites))

      if (coverFile) {
        formData.append('coverImage', coverFile)
      }

      // Debug: Log FormData contents
      console.log('📤 FormData contents:')
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}:`, value.name, `(${value.size} bytes)`)
        } else {
          console.log(`  ${key}:`, value)
        }
      }

      const res = await instructorService.createCourse(formData)

      if (res.success) {
        console.log('✅ Course created successfully:', res.data)
        toast.success('Course created successfully!')
        router.push(`/dashboard/instructor/courses/${res.data._id}`)
      } else {
        console.error('❌ Create course failed:', res.error)
        setError(res.error || 'Failed to create course')
        toast.error(res.error || 'Failed to create course')
      }
    } catch (err: any) {
      console.error('❌ Error:', err)
      setError(err.message || 'Failed to create course')
      toast.error(err.message || 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <InstructorSidebar />

      <div className="flex-1 ml-64 px-6 py-10">
        <div className="max-w-3xl mx-auto bg-slate-900/60 border border-gray-800 rounded-2xl p-8">
          {/* Header with AI Button */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Create Course</h1>
              <p className="text-gray-400 text-sm">Fill in the details or use AI to generate structure</p>
            </div>
            
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={aiGenerating || !form.title.trim() || !form.programId}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl text-sm"
            >
              {aiGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  AI Generate
                </>
              )}
            </button>
          </div>

          {error && <ErrorBox message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Course Title" 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              required 
              placeholder="e.g., Introduction to Machine Learning"
            />
            <p className="text-xs text-gray-500 -mt-4">
              Enter a title and select a program, then click "AI Generate" to auto-fill
            </p>
            
            {/* Program - REQUIRED */}
            <Select
              label="Program"
              name="programId"
              value={form.programId}
              onChange={handleChange}
              disabled={programsLoading}
              required
              options={programs.map(p => ({ value: p._id, label: p.title }))}
            />

            {/* 🔍 Debug: Show selected program */}
            {form.programId && (
              <div className="text-xs text-emerald-400 -mt-4">
                ✓ Selected program: {programs.find(p => p._id === form.programId)?.title}
              </div>
            )}

            <Textarea 
              label="Description" 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              required 
              placeholder="Describe what students will learn in this course..."
            />

            <Input 
              label="Target Audience" 
              name="targetAudience" 
              value={form.targetAudience} 
              onChange={handleChange} 
              required 
              placeholder="e.g., Beginners with basic programming knowledge"
            />

            <Input 
              label="Estimated Hours" 
              name="hours" 
              type="number" 
              value={form.hours} 
              onChange={handleChange} 
              min="0"
              placeholder="e.g., 40"
            />

            {/* Objectives */}
            <DynamicList
              title="Learning Objectives"
              items={form.objectives}
              onChange={(i: any, v: any) => handleArrayChange('objectives', i, v)}
              onAdd={() => addField('objectives')}
              onRemove={(i: any) => removeField('objectives', i)}
              placeholder="e.g., Understand machine learning fundamentals"
            />

            {/* Prerequisites */}
            <DynamicList
              title="Prerequisites"
              items={form.prerequisites}
              onChange={(i: any, v: any) => handleArrayChange('prerequisites', i, v)}
              onAdd={() => addField('prerequisites')}
              onRemove={(i: any) => removeField('prerequisites', i)}
              placeholder="e.g., Basic Python programming"
            />

            {/* Cover Image Upload */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Course Cover Image</label>
              <p className="text-xs text-gray-500 mb-3">
                Recommended: 1280×720 or larger
              </p>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-slate-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white hover:bg-slate-700 transition">
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      console.log('📷 Cover image selected:', file.name, file.size, 'bytes')
                      setCoverFile(file)
                      setCoverPreview(URL.createObjectURL(file))
                    }}
                  />
                </label>

                {coverPreview && (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🗑️ Cover image removed')
                        setCoverFile(null)
                        setCoverPreview(null)
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-400 text-slate-900 py-3 rounded-xl font-semibold hover:bg-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Course...' : 'Create Course'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Reusable UI ---------------- */

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-400 mb-1 block">
      {label} {props.required && <span className="text-red-400">*</span>}
    </label>
    <input {...props} className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none transition" />
  </div>
)

const Textarea = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-400 mb-1 block">
      {label} {props.required && <span className="text-red-400">*</span>}
    </label>
    <textarea {...props} rows={4} className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none transition" />
  </div>
)

const Select = ({ label, options, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-400 mb-1 block">
      {label} {props.required && <span className="text-red-400">*</span>}
    </label>
    <select {...props} className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none transition">
      <option value="">Select a program</option>
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
)

const DynamicList = ({ title, items, onChange, onAdd, onRemove, placeholder }: any) => (
  <div>
    <label className="text-sm text-gray-400 mb-2 block">{title}</label>
    <div className="space-y-2">
      {items.map((item: string, i: number) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-400 focus:outline-none transition"
          />
          {items.length > 1 && (
            <button 
              type="button" 
              onClick={() => onRemove(i)} 
              className="px-3 text-red-400 hover:text-red-300 transition"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button 
        type="button" 
        onClick={onAdd} 
        className="text-emerald-400 text-sm hover:text-emerald-300 transition"
      >
        + Add {title.includes('Objectives') ? 'Objective' : 'Prerequisite'}
      </button>
    </div>
  </div>
)

const ErrorBox = ({ message }: any) => (
  <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-lg text-sm mb-6">
    {message}
  </div>
)