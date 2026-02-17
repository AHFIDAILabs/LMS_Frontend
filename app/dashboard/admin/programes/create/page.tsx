'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { programService } from '@/services/programService'
import { courseService } from '@/services/courseService'
import { hybridAIService } from '@/services/hybridAIService'
import { Course } from '@/types'
import {
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  BookOpen,
  Sparkles,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CreateProgramPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: [] as string[],
    estimatedHours: '',
    price: '',
    currency: 'USD',
    tags: [''],
    objectives: [''],
    prerequisites: [''],
    targetAudience: '',
    isSelfPaced: true,
    isPublished: false,
  })

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    fetchCourses()
  }, [authLoading, isAuthenticated, user])

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await courseService.getAllCoursesAdmin({ isPublished: true })
      
      if (response.success && Array.isArray(response.data)) {
        setCourses(response.data)
      }
    } catch (err: any) {
      console.error('Failed to fetch courses:', err)
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleLevelChange = (level: string) => {
    setFormData(prev => ({
      ...prev,
      level: prev.level.includes(level)
        ? prev.level.filter(l => l !== level)
        : [...prev.level, level]
    }))
  }

  const handleArrayChange = (field: 'tags' | 'objectives' | 'prerequisites', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: 'tags' | 'objectives' | 'prerequisites') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'tags' | 'objectives' | 'prerequisites', index: number) => {
    if (formData[field].length === 1) {
      toast.error(`Program must have at least one ${field.slice(0, -1)}`)
      return
    }
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  // AI Generate Program Structure
  const handleAIGenerate = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a program title first')
      return
    }

    try {
      setAiGenerating(true)
      toast.loading('AI is generating program structure...', { id: 'ai-gen' })

      const aiResult = await hybridAIService.generateProgramStructure(
        formData.title,
        formData.category || undefined,
        formData.description || undefined,
        formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined
      )

      // Update form with AI suggestions
      setFormData(prev => ({
        ...prev,
        title: aiResult.name || prev.title,
        description: aiResult.description || prev.description,
        category: aiResult.category || prev.category,
        estimatedHours: aiResult.duration?.toString() || prev.estimatedHours,
        price: aiResult.price?.toString() || prev.price,
        tags: aiResult.tags && aiResult.tags.length > 0 ? aiResult.tags : prev.tags,
        objectives: aiResult.learningOutcomes && aiResult.learningOutcomes.length > 0 
          ? aiResult.learningOutcomes 
          : prev.objectives,
      }))

      toast.success('AI generated program structure!', { id: 'ai-gen' })
    } catch (err: any) {
      console.error('AI generation error:', err)
      toast.error('Failed to generate with AI. Please fill manually.', { id: 'ai-gen' })
    } finally {
      setAiGenerating(false)
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Program title is required')
      return false
    }
    
    if (!formData.description.trim()) {
      setError('Program description is required')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      setError(null)
      
      const filteredTags = formData.tags.filter(t => t.trim())
      const filteredObjectives = formData.objectives.filter(t => t.trim())
      const filteredPrerequisites = formData.prerequisites.filter(t => t.trim())
      
      const programData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim() || undefined,
        level: formData.level.length > 0 ? formData.level : undefined,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency || 'USD',
        tags: filteredTags.length > 0 ? filteredTags : undefined,
        objectives: filteredObjectives.length > 0 ? filteredObjectives : undefined,
        prerequisites: filteredPrerequisites.length > 0 ? filteredPrerequisites : undefined,
        targetAudience: formData.targetAudience.trim() || undefined,
        isSelfPaced: formData.isSelfPaced,
        isPublished: formData.isPublished,
        courses: selectedCourses.length > 0 ? selectedCourses : undefined,
      }
      
      const response = await programService.createProgram(programData)
      
      if (response.success) {
        setSuccess(true)
        toast.success('Program created successfully!')
        setTimeout(() => {
          router.push('/dashboard/admin/programes')
        }, 1500)
      } else {
        setError(response.error || 'Failed to create program')
        toast.error(response.error || 'Failed to create program')
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while creating the program'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loadingCourses) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {/* Back Button */}
        <Link
          href="/dashboard/admin/programes"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Programs
        </Link>

        <div className="max-w-4xl">
          {/* Header with AI Button */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Create New Program</h1>
              <p className="text-gray-400">Fill in the details or use AI to generate structure</p>
            </div>
            
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={aiGenerating || !formData.title.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              {aiGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  AI Generate
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4">
              <p className="text-green-400 flex items-center gap-2">
                <AlertCircle size={20} />
                Program created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <p className="text-red-400 flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="text-red-300 text-sm underline mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Program Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Full Stack Web Development Program"
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a title and click "AI Generate" to auto-fill the rest
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the program..."
                    rows={4}
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition resize-none"
                    required
                  />
                </div>

                {/* Category & Target Audience */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g., Programming, Design"
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      placeholder="e.g., Beginners, Professionals"
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                  </div>
                </div>

                {/* Level Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Program Level
                  </label>
                  <div className="flex gap-3">
                    {['beginner', 'intermediate', 'advanced'].map(level => (
                      <label
                        key={level}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.level.includes(level)
                            ? 'bg-lime-500/20 border-lime-500/50 text-lime-400'
                            : 'bg-slate-700/30 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.level.includes(level)}
                          onChange={() => handleLevelChange(level)}
                          className="sr-only"
                        />
                        <span className="capitalize font-medium">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Estimated Hours, Price, Currency */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      name="estimatedHours"
                      value={formData.estimatedHours}
                      onChange={handleInputChange}
                      placeholder="e.g., 120"
                      min="0"
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0 for free"
                      min="0"
                      step="0.01"
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="NGN">NGN (₦)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Tags</h2>
                <button
                  type="button"
                  onClick={() => addArrayItem('tags')}
                  className="flex items-center gap-2 text-lime-400 hover:text-lime-300 text-sm transition-colors"
                >
                  <Plus size={16} />
                  Add Tag
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                      placeholder="e.g., web-development, javascript"
                      className="flex-1 bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('tags', index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Learning Objectives</h2>
                <button
                  type="button"
                  onClick={() => addArrayItem('objectives')}
                  className="flex items-center gap-2 text-lime-400 hover:text-lime-300 text-sm transition-colors"
                >
                  <Plus size={16} />
                  Add Objective
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => handleArrayChange('objectives', index, e.target.value)}
                      placeholder="e.g., Build full-stack web applications"
                      className="flex-1 bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('objectives', index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Prerequisites</h2>
                <button
                  type="button"
                  onClick={() => addArrayItem('prerequisites')}
                  className="flex items-center gap-2 text-lime-400 hover:text-lime-300 text-sm transition-colors"
                >
                  <Plus size={16} />
                  Add Prerequisite
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.prerequisites.map((prerequisite, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={prerequisite}
                      onChange={(e) => handleArrayChange('prerequisites', index, e.target.value)}
                      placeholder="e.g., Basic HTML/CSS knowledge"
                      className="flex-1 bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                    {formData.prerequisites.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('prerequisites', index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Course Selection */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <div className='flex justify-between items-center mb-4'>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Add Courses to Program
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Select courses to include in this program (optional)
                  </p>
                </div>

                <Link
                  href="/dashboard/admin/courses/create"
                  className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-slate-900 px-4 py-2 rounded-xl font-semibold transition-colors"
                >
                  <Plus size={20} />
                  Create Course
                </Link>
              </div>

              {courses.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {courses.map(course => (
                    <label
                      key={course._id}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedCourses.includes(course._id)
                          ? 'bg-lime-500/10 border-lime-500/50'
                          : 'bg-slate-700/30 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course._id)}
                        onChange={() => toggleCourseSelection(course._id)}
                        className="mt-1 w-4 h-4 rounded border-gray-600 text-lime-500 focus:ring-lime-400"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{course.category}</span>
                          {course.level && course.level.length > 0 && (
                            <>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-400 capitalize">{course.level[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen size={48} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No published courses available</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Create and publish courses first to add them to programs
                  </p>
                </div>
              )}
              
              {selectedCourses.length > 0 && (
                <p className="text-lime-400 text-sm mt-4">
                  {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Settings */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6 space-y-4">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isSelfPaced"
                  checked={formData.isSelfPaced}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray-600 text-lime-500 focus:ring-lime-400 focus:ring-offset-slate-800"
                />
                <div>
                  <p className="text-white font-medium">Self-paced learning</p>
                  <p className="text-gray-400 text-sm">Students can complete at their own pace</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray-600 text-lime-500 focus:ring-lime-400 focus:ring-offset-slate-800"
                />
                <div>
                  <p className="text-white font-medium">Publish immediately</p>
                  <p className="text-gray-400 text-sm">Make this program visible to students right away</p>
                </div>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Creating...' : 'Create Program'}
              </button>
              
              <Link
                href="/dashboard/admin/programes"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}