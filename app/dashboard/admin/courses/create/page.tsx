'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import { useAuth } from '@/lib/context/AuthContext'
import { courseService } from '@/services/courseService'
import { adminService } from '@/services/adminService'
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { programService } from '@/services/programService'

interface Instructor {
  _id: string
  firstName: string
  lastName: string
  email: string
}

interface Program {
  _id: string
  name: string
}

export default function CreateCoursePage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    instructor: '',
    program: '',
    duration: '',
    requirements: [''],
    learningOutcomes: [''],
    isPublished: false,
  })

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    fetchInstructorsAndPrograms()
  }, [authLoading, isAuthenticated, user])

  const fetchInstructorsAndPrograms = async () => {
    try {
      setLoadingData(true)
      
      // Fetch instructors
      const instructorsResponse = await adminService.getAllInstructors()
      if (instructorsResponse.success && Array.isArray(instructorsResponse.data)) {
        setInstructors(instructorsResponse.data)
      }
      
      // Fetch programs - you'll need to add this to your service
      const programsResponse = await programService.getPrograms()
      if (programsResponse.success && Array.isArray(programsResponse.data)) {
        setPrograms(programsResponse.data)
      }
      
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoadingData(false)
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

  const handleArrayFieldChange = (field: 'requirements' | 'learningOutcomes', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field: 'requirements' | 'learningOutcomes') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayField = (field: 'requirements' | 'learningOutcomes', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setThumbnailFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview('')
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
    
    if (!formData.category.trim()) {
      setError('Course category is required')
      return false
    }
    
    if (!formData.instructor) {
      setError('Please select an instructor')
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
      data.append('description', formData.description)
      data.append('category', formData.category)
      data.append('level', formData.level)
      data.append('instructor', formData.instructor)
      
      if (formData.program) {
        data.append('program', formData.program)
      }
      
      if (formData.duration) {
        data.append('duration', formData.duration)
      }
      
      data.append('isPublished', String(formData.isPublished))
      
      // Add arrays
      const filteredRequirements = formData.requirements.filter(r => r.trim())
      const filteredOutcomes = formData.learningOutcomes.filter(o => o.trim())
      
      if (filteredRequirements.length > 0) {
        data.append('requirements', JSON.stringify(filteredRequirements))
      }
      
      if (filteredOutcomes.length > 0) {
        data.append('learningOutcomes', JSON.stringify(filteredOutcomes))
      }
      
      // Add thumbnail
      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile)
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

  if (authLoading || loadingData) {
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
                    placeholder="e.g., Introduction to Web Development"
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    required
                  />
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

                {/* Category and Level */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g., Programming, Design"
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Level *
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (in minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 120"
                    min="0"
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Instructor and Program */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Assignment</h2>
              
              <div className="space-y-4">
                {/* Instructor */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instructor *
                  </label>
                  <select
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    required
                  >
                    <option value="">Select an instructor</option>
                    {instructors.map(instructor => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.firstName} {instructor.lastName} ({instructor.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Program */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Program 
                  </label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                  >
                    <option value="">No program</option>
                    {programs.map(program => (
                      <option key={program._id} value={program._id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Course Thumbnail</h2>
              
              <div className="space-y-4">
                {thumbnailPreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-700">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
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
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 hover:text-lime-400 transition-colors">
                      <Upload size={48} />
                      <p className="mt-2 text-sm">Click to upload thumbnail</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Requirements</h2>
                <button
                  type="button"
                  onClick={() => addArrayField('requirements')}
                  className="flex items-center gap-2 text-lime-400 hover:text-lime-300 text-sm transition-colors"
                >
                  <Plus size={16} />
                  Add Requirement
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
                      placeholder="e.g., Basic understanding of HTML"
                      className="flex-1 bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('requirements', index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Learning Outcomes</h2>
                <button
                  type="button"
                  onClick={() => addArrayField('learningOutcomes')}
                  className="flex items-center gap-2 text-lime-400 hover:text-lime-300 text-sm transition-colors"
                >
                  <Plus size={16} />
                  Add Outcome
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => handleArrayFieldChange('learningOutcomes', index, e.target.value)}
                      placeholder="e.g., Build responsive websites"
                      className="flex-1 bg-slate-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                    />
                    {formData.learningOutcomes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('learningOutcomes', index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
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
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
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