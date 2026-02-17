'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { courseService } from '@/services/courseService'
import { programService } from '@/services/programService'
import { Program } from '@/types'
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

export default function CreateCoursePage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(true)

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    program: '',
    order: '1',
    estimatedHours: '',
    objectives: [''],
    prerequisites: [''],
    targetAudience: '',
    isPublished: false,
    minimumQuizScore: '70',
    requiredProjects: '5',
    capstoneRequired: true,
  })

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    fetchPrograms()
  }, [authLoading, isAuthenticated, user])

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true)
      const response = await programService.getPrograms({ isPublished: true })
      
      if (response.success && Array.isArray(response.data)) {
        setPrograms(response.data)
      }
    } catch (err: any) {
      console.error('Failed to fetch programs:', err)
    } finally {
      setLoadingPrograms(false)
    }
  }

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      
      // Auto-generate slug when title changes
      if (name === 'title' && !formData.slug) {
        setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
      }
    }
  }

  const handleArrayFieldChange = (field: 'objectives' | 'prerequisites', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field: 'objectives' | 'prerequisites') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayField = (field: 'objectives' | 'prerequisites', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }
      
      setCoverImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCoverImage = () => {
    setCoverImageFile(null)
    setCoverImagePreview('')
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Course title is required')
      return false
    }
    
    if (!formData.description.trim()) {
      setError('Course description is required')
      return false
    }
    
    if (!formData.program) {
      setError('Please select a program')
      return false
    }
    
    if (!formData.slug.trim()) {
      setError('Course slug is required')
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
      
      // Create FormData for file upload
      const data = new FormData()
      
      // Add basic fields
      data.append('title', formData.title)
      data.append('slug', formData.slug)
      data.append('description', formData.description)
      data.append('program', formData.program)
      data.append('order', formData.order)
      
      if (formData.estimatedHours) {
        data.append('estimatedHours', formData.estimatedHours)
      }
      
      if (formData.targetAudience) {
        data.append('targetAudience', formData.targetAudience)
      }
      
      data.append('isPublished', String(formData.isPublished))
      
      // Add objectives
      const filteredObjectives = formData.objectives.filter(o => o.trim())
      if (filteredObjectives.length > 0) {
        data.append('objectives', JSON.stringify(filteredObjectives))
      }
      
      // Add prerequisites
      const filteredPrerequisites = formData.prerequisites.filter(p => p.trim())
      if (filteredPrerequisites.length > 0) {
        data.append('prerequisites', JSON.stringify(filteredPrerequisites))
      }
      
      // Add completion criteria
      data.append('completionCriteria', JSON.stringify({
        minimumQuizScore: parseInt(formData.minimumQuizScore),
        requiredProjects: parseInt(formData.requiredProjects),
        capstoneRequired: formData.capstoneRequired
      }))
      
      // Add cover image
      if (coverImageFile) {
        data.append('coverImage', coverImageFile)
      }
      
      const response = await courseService.createCourse(data)
      
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/admin/courses')
        }, 1500)
      } else {
        setError(response.error || 'Failed to create course')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the course')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loadingPrograms) {
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
          href="/dashboard/admin/courses"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Courses
        </Link>

        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Course</h1>
          <p className="text-gray-400 mb-8">Fill in the details to create a new course</p>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4">
              <p className="text-green-400 flex items-center gap-2">
                <AlertCircle size={20} />
                Course created successfully! Redirecting...
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
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Introduction to Python Programming"
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="e.g., intro-to-python-programming"
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">Auto-generated from title, but you can customize it</p>
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
                    placeholder="Provide a detailed description of the course..."
                    rows={4}
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition resize-none"
                    required
                  />
                </div>

                {/* Program, Order, and Hours */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Program *
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                      required
                    >
                      <option value="">Select program</option>
                      {programs.map(program => (
                        <option key={program._id} value={program._id}>
                          {program.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      name="estimatedHours"
                      value={formData.estimatedHours}
                      onChange={handleInputChange}
                      placeholder="e.g., 40"
                      min="0"
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="e.g., Beginners with no programming experience"
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Cover Image</h2>
              
              <div className="space-y-4">
                {coverImagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-700">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full h-48 border-2 border-dashed border-gray-600 rounded-lg hover:border-lime-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 hover:text-lime-400 transition-colors">
                      <Upload size={48} />
                      <p className="mt-2 text-sm">Click to upload cover image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Objectives */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Course Objectives</h2>
                <button
                  type="button"
                  onClick={() => addArrayField('objectives')}
                  className="flex items-center gap-2 text-lime-400 hover:text-lime-300 text-sm transition-colors"
                >
                  <Plus size={16} />
                  Add Objective
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.objectives.map((obj, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => handleArrayFieldChange('objectives', index, e.target.value)}
                      placeholder="e.g., Understand Python syntax and data types"
                      className="flex-1 bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('objectives', index)}
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
                  onClick={() => addArrayField('prerequisites')}
                  className="flex items-center gap-2 text-lime-400 hover:text-lime-300 text-sm transition-colors"
                >
                  <Plus size={16} />
                  Add Prerequisite
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.prerequisites.map((prereq, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={prereq}
                      onChange={(e) => handleArrayFieldChange('prerequisites', index, e.target.value)}
                      placeholder="e.g., Basic computer skills"
                      className="flex-1 bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                    {formData.prerequisites.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('prerequisites', index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Criteria */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Completion Criteria</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Quiz Score (%)
                  </label>
                  <input
                    type="number"
                    name="minimumQuizScore"
                    value={formData.minimumQuizScore}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Required Projects
                  </label>
                  <input
                    type="number"
                    name="requiredProjects"
                    value={formData.requiredProjects}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="capstoneRequired"
                    checked={formData.capstoneRequired}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-gray-600 text-lime-500 focus:ring-lime-400 focus:ring-offset-slate-800"
                  />
                  <div>
                    <p className="text-white font-medium">Capstone Project Required</p>
                    <p className="text-gray-400 text-sm">Students must complete a capstone project to finish this course</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Publish Option */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
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
                  <p className="text-gray-400 text-sm">Make this course visible to students right away</p>
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
                {loading ? 'Creating...' : 'Create Course'}
              </button>
              
              <Link
                href="/dashboard/admin/courses"
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